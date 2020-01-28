import sys, os, random
import numpy as np
import gsm
from gsm import tdict, tlist, tset, tdeque, tstack, containerify
from gsm.common.elements import Deck
from gsm.common.world import grid
from gsm.common import TurnPhaseStack

from .phases import *
from .objects import Card, DiscardPile, DrawPile, Deck_WA

MY_PATH = os.path.dirname(os.path.abspath(__file__))

class Game01(gsm.GameController):
	
	def __init__(self, player_names, debug=False, force_order=False):
		
		# create player manager
		manager = gsm.GameManager(open={'name','hand'})
		
		stack = TurnPhaseStack()
		
		log = gsm.GameLogger(indent_level=0)
		
		super().__init__(debug=debug,
		                 manager=manager,
		                 stack=stack,
		                 log=log,
		                 info_path=os.path.join(MY_PATH, 'info.yaml'),
		                 player_names=player_names,
		                 force_order=force_order,
		                 )
		
		# register config files
		self.register_config('cards', os.path.join(MY_PATH,'config/cards.yaml'))
		self.register_config('rules', os.path.join(MY_PATH, 'config/rules.yaml'))
		
		# register game object types
		self.register_obj_type(name='card', obj_cls=Card)
		self.register_obj_type(name='deck52', obj_cls=Deck_WA, open={'count'})
		#self.register_obj_type(name='draw_pile', obj_cls=DrawPile)
		# self.register_obj_type(name='card', obj_cls=CardBase)
		# self.register_obj_type(name='deck', obj_cls=Deck)

		# register possible phases
		self.register_phase(name='phase1', cls=RoyalPhase)
		self.register_phase(name='phase2', cls=ExamplePhase)

	def _pre_setup(self, config, info=None):
		# register players
		assert 2 <= len(self.player_names) <= 4, 'Not the right number of players: {}'.format(len(self.player_names))
		for name in self.player_names:
			if name not in info.player_names:
				raise gsm.signals.InvalidPlayerError(name)
			self.register_player(name)

	def _set_phase_stack(self, config):
		self.stack.set_player_order(tlist(self.players))
		return tlist(['phase2'])

	# def _select_player(self):
	# 	return next(iter(self.players))

	def _init_game(self, config):
		cards = tlist()
		for n, c in config.cards.items():
			cards.extend([c])
		self.state.deck = self.table.create(obj_type='deck52', cards=cards,
		                                        seed=self.RNG.getrandbits(64),
		                                        default='card')
		self.state.deck.shuffle()

		for i, player in enumerate(self.players):
			player.order = i + 1
			player.hand = tset()
			for k in range(5):
				c1 = self.state.deck.draw()
				c1.face_down(player)
				#c1.visible = tset([player])
				player.hand.add(c1) #bei 1 card kann add nehmen, bei set of cards muss update nehmen!
		self.state.deck.count = len(self.state.deck)

	def _end_game(self):
		out = tdict()
		winners = tlist()
		for name in self.players.values():
			winners.append(name)
		out.winner = random.choice(winners)
		print('winner is {}'.format(out.winner))
		return out
	
	def cheat(self, code=None):
		self.log.writef('Cheat code activated: {}', code)
		self.log.iindent()
		self.log.dindent()


gsm.register_game(Game01, os.path.join(MY_PATH, 'info.yaml'))
