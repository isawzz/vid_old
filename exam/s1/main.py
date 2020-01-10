import sys, os
import numpy as np
import gsm
from gsm import tdict, tlist, tset
from gsm.common import world, TurnPhaseStack

from .phases import TicPhase
from .objects import Board, Tick

MY_PATH = os.path.dirname(os.path.abspath(__file__))

class s1(gsm.GameController):
	
	def __init__(self, player_names, debug=False):
		
		# create player manager
		manager = gsm.GameManager(open={'symbol'},
		                          hidden={'val'})
		
		super().__init__(debug=debug,
		                 manager=manager,
		                 stack=TurnPhaseStack(),
		                 info_path=os.path.join(MY_PATH, 'info.yaml'),
		                 player_names = player_names)
		
		# register config files
		self.register_config('basic', os.path.join(MY_PATH,'config/basics.yaml'))
		
		# register players
		# assert len(player_names) == 3, 'Not the right number of players'
		# self.register_player(player_names[0], val=1)
		# self.register_player(player_names[1], val=-1)
		# self.register_player(player_names[2], val=2)

		# register game object types
		self.register_obj_type(obj_cls=Tick)
		self.register_obj_type(obj_cls=Board)
		
		# register possible phases
		self.register_phase(name='tic', cls=TicPhase)

	def _pre_setup(self, config, info=None):
		# register players
		assert len(self.player_names) in {2,3,4,5}, 'Not the right number of players: {}'.format(self.player_names)
		for name in self.player_names:
			if name not in info.player_names:
				raise gsm.signals.InvalidPlayerError(name)
			self.register_player(name, num_res=0, color=name)

	def _set_phase_stack(self, config):
		self.stack.set_player_order(tlist(self.players))
		return tlist(['tic'])
	
	def _select_player(self):
		return next(iter(self.players))
	
	def _init_game(self, config):
		
		# update player props
		chars = config.basic.characters.split()
		vals = config.basic.vals.split()
		i = 0
		for plid in self.players:
			self.players[plid].symbol = chars[i]
			self.players[plid].val = int(vals[i])
			i+=1

		# init state
		
		side = config.basic.side_length
		stride = config.basic.stride_length
		
		grid = world.make_quadgrid(rows=side, cols=side, table=self.table,
		                           field_obj_type='Tick', grid_obj_type='Board')
		
		self.state.board = grid
		self.state.limit = stride
		
	def _end_game(self):
		
		val = self.state.winner
		
		if val is None:
			self.log.writef('Game over! Draw game!')
			return tdict(winner=None)
		
		for player in self.players:
			if player.val == val:
				self.log.writef('Game Over! {} wins!', player)
				return tdict(winner=player.name)
			
		raise Exception('No player with val: {}'.format(val))
	
gsm.register_game(s1, os.path.join(MY_PATH, 'info.yaml'))
