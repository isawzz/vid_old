import sys, os
import time
import pickle
import yaml
import json
from collections import OrderedDict
from ..mixins import Named
from ..signals import WrappedException, InvalidValueError, RegistryCollisionError, NoActiveGameError, UnknownGameError, LoadConsistencyError, UnknownInterfaceError, UnknownPlayerError, UnknownUserError
from .registry import _game_registry, get_trans
from .transmit import send_http

class Host(object):
	def __init__(self, address, debug=False, auto_num_players=True, **settings):
		super().__init__()
		
		self._in_progress = False
		self.debug = debug
		self.auto_num_players = auto_num_players
		self.game = None
		self.ctrl_cls = None
		self.ctrl = None
		self.info = None
		
		self.address = address
		self.settings = settings
		
		self.roles = OrderedDict()
		self.players = OrderedDict()
		self.users = set()
		
		self.interfaces = OrderedDict()
		
		self.advisors = OrderedDict()
		self.spectators = set()
		
		self.auto_pause = False
		
	def toggle_pause(self):
		self.auto_pause ^= True
		return 'auto pause is {}activated'.format('' if self.auto_pause else 'de')
		
	def continue_step(self, user=None):
		self._passive_frontend_step()
		if user is None:
			return 'continued'
		return self.get_status(user)
	
	def get_roles(self):
		return self.roles
	
	def get_available_games(self):
		return list(_game_registry.keys())
		
	def get_available_players(self):
		all_players = list(self.get_game_info()['player_names'])
		for p in self.players:
			if p in all_players:
				all_players.remove(p)
		return all_players
		
	def get_game_info(self, name=None):
		if name is None:
			name = self.game
		if name not in _game_registry:
			raise UnknownGameError
		return _game_registry[name][1]
	
	def set_game(self, name):
		
		if name not in _game_registry:
			raise UnknownGameError
		
		cls, info = _game_registry[name]
		
		self.game = name
		self.info = info
		self.ctrl_cls = cls
		
		return 'Game set to: {}'.format(name)
	
	def add_passive_client(self, *users, address=None,
	                       interface=None, settings={}):
		
		if address is not None:
			assert interface is not None, 'must specify the interface to be used'
			trans = 'http'
			args = (address, self.address)
			settings = {}
		else:
			trans = 'proc'
			args = self.address, interface, *users
		
		interface_type = interface
		
		if interface_type == 'agent':
			settings['game'] = self.game
		
		interface = get_trans(trans)(*args, **settings)
		
		for user in users:
			self.interfaces[user] = interface
			self.users.add(user)
		
		out = 'Using {} for: {}'.format(address, ', '.join(users)) if address is not None else \
			'Created an interface ({}) for: {}'.format(interface_type, ', '.join(users))
		
		return out
		
	def add_spectator(self, user, advisor=None):
		self.users.add(user)
		if advisor is not None:
			self.advisors[user] = advisor
			if advisor not in self.players:
				self.players[advisor] = []
			self.players[advisor].append(user)
			if user in self.interfaces:
				self.interfaces[user].set_player(user, advisor)
		else:
			self.spectators.add(user)
		
		if advisor is None:
			return '{} has joined as a spectator'.format(user)
		return '{} has joined as an advisor for {}'.format(user, advisor)
	
	def add_player(self, user, player):
		
		if player not in self.info['player_names']:
			return 'No player is called: {}'.format(player)
		
		if player not in self.players:
			self.players[player] = []
		self.players[player].append(user)
		self.roles[user] = player
		self.users.add(user)
		if user in self.interfaces:
			self.interfaces[user].set_player(user, player)
		
		return '{} is now playing {}'.format(user, player)
		
	def init_game(self, seed=None):
		
		if self.ctrl_cls is None:
			raise Exception('Must set a game first')
		if len(self.players) not in self.info['num_players']:
			raise Exception('Invalid number of players {}, allowed for {}: {}'.format(len(self.players), self.info.name,
			                                                                          ', '.join(self.info.num_players)))
		
		for user, interface in self.interfaces.items():
			interface.reset(user)
		
		player = next(iter(self.players.keys()))
		
		self.ctrl = self.ctrl_cls(debug=self.debug, player_names= list(self.players.keys()),
		                          **self.settings)
		self.ctrl.reset(player, seed=seed)
		
		
	def begin_game(self, seed=None):
		
		self.init_game(seed)
		
		self._passive_frontend_step()
		
		return '{} has started'.format(self.info['name'])
	
	def reset(self):
		self.ctrl = None
		self.settings.clear()
	
	def set_setting(self, key, value):
		self.settings[key] = value
		return 'Set {}: {}'.format(key, value)
	def del_setting(self, key):
		del self.settings[key]
		return 'Del {}'.format(key)
	def clear_settings(self):
		self.settings.clear()
		return 'Settings have been cleared'
	def update_settings(self, settings):
		self.settings.update(settings)
		return 'Settings now contains {} tuple'.format(len(self.settings))
	
	def get_active_players(self):
		return self.ctrl.get_active_players()
	
	def cheat(self, code=None):
		self.ctrl.cheat(code)
		return 'Cheat code: {}'.format(code)
	
	def save_game(self, path, save_interfaces=False):
		if self.ctrl is None:
			raise NoActiveGameError
		state = self.ctrl.save()
		data = {'state':state, 'players':self.roles}
		
		if save_interfaces:
			data['interfaces'] = {user:interface.save() for user, interface in self.interfaces.items()}
		
		pickle.dump(data, open(path, 'wb'))
		
		print('Game saved to: {}'.format(path))
		
		return 'game {} saved'.format(os.path.basename(path))
	
	def load_game(self, path, load_interfaces=True):
		
		self.init_game(seed=None)
		
		data = pickle.load(open(path, 'rb'))
		
		missing = []
		for user, player in data['players'].items():
			if user in self.users:
				if player not in self.players: # player is not already registered
					self.add_player(user, player)
			else:
				missing.append(player)
		
		if load_interfaces and 'interfaces' in data:
			for user, state in data['interfaces'].items():
				if user in self.interfaces:
					self.interfaces[user].load(state)
					print('Loaded {}'.format(user))
				
		self.ctrl.load(data['state'])
		
		ms = ''
		if len(missing):
			ms = ' Missing players: {}'.format(', '.join(missing))
		
		return 'Game {} loaded{}.{}'.format(os.path.basename(path), ' with the interfaces' if load_interfaces else '', ms)
	
	def take_action(self, user, group, action, key):
		if user not in self.roles:
			raise UnknownUserError
		player = self.roles[user]
		msg = self.ctrl.step(player, group, action, key)
		
		out = json.loads(msg)
		if 'error' in out:
			return msg
		
		if self._passive_frontend_step():
			msg = self.ctrl.get_status(player)
		return msg
	
	def give_advice(self, user, group, action):
		if user not in self.advisors:
			raise UnknownUserError
		player = self.advisors[user]
		self.ctrl.give_advice(player, group=group, action=action, user=user)
		return 'Advice for {} is posted'.format(player)
	
	def _passive_frontend_step(self):
		
		no_passive = False
		recheck = False
		first = True
		
		advised = set()
		
		while not no_passive:
			no_passive = True
			players = json.loads(self.ctrl.get_active_players())
			
			if self.auto_pause and not first:
				return recheck
			for player in players:
				for user in self.players[player]:
					if user in self.interfaces and user not in advised:
						no_passive = False
						
						if user in self.roles:
							status = self.ctrl.get_status(player)
						else:
							status = self.ctrl.get_advisor_status(player)
							advised.add(user)
						
						status = json.loads(status)
						
						if 'options' in status:
							msg = self.interfaces[user].step(user, status)
							if msg is not None:
								msg = json.loads(msg)
						else:
							msg = None
						
						if msg is None:
							return recheck
						elif 'key' in msg: # TODO: enable spectator/advisor handling
							msg = self.ctrl.step(player, group=msg['group'], action=msg['action'], key=msg['key'])
							msg = json.loads(msg)
							recheck = True
						elif 'action' in msg:
							self.give_advice(user, group=msg['group'], action=msg['action'])
							recheck = True
						
						if 'error' in msg:
							raise WrappedException(msg['error']['type'], msg['error']['msg'])
							# print(msg)
							# print('*** ERROR: {} ***'.format(msg['error']['type']))
							# print(msg['error']['msg'])
							# print('****************************')
							# assert False
							
						break
			first = False
		
		return recheck
	
	def ping_interfaces(self):
		pings = {}
		for user, interface in self.interfaces.items():
			start = time.time()
			response = interface.ping() # TODO: check to make sure theres no timeout
			pings[user] = response, time.time() - start
		return json.dumps(pings)
	
	def get_status(self, user):
		if self.ctrl is None:
			raise NoActiveGameError
		if user in self.roles:
			player = self.roles[user]
			return self.ctrl.get_status(player)
		if user in self.advisors:
			player = self.advisors[user]
			return self.ctrl.get_advisor_status(player)
		if user in self.spectators:
			return self.ctrl.get_spectator_status()
		raise UnknownUserError
	
	def get_player(self, user):
		if user not in self.users:
			raise InvalidValueError(user)
		if self.ctrl is None:
			raise NoActiveGameError
		player = self.roles[user]
		return self.ctrl.get_player(player)
		
	def get_table(self, user):
		if user not in self.roles:
			raise InvalidValueError(user)
		if self.ctrl is None:
			raise NoActiveGameError
		player = self.roles[user]
		return self.ctrl.get_table(player)
	
	def get_log(self, user, god=False):
		if self.ctrl is None:
			raise NoActiveGameError
		if user not in self.roles:
			return self.ctrl.get_log(god_mode=god)
		player = self.roles[user]
		return self.ctrl.get_log(player, god_mode=god)
	
	def get_obj_types(self):
		if self.ctrl is None:
			raise NoActiveGameError
		return self.ctrl.get_obj_types()
	