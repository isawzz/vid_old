# from gsm.common import TurnPhase
#
# import numpy as np
# from gsm import GameOver, GamePhase, GameActions, GameObject
# from gsm import tset, tdict, tlist
# from gsm import SwitchPhase, PhaseComplete
#
# class ExamplePhase(TurnPhase):
# 	def __init__(self, **other):
# 		super().__init__(**other)
#
# 	def execute(self, C, player=None, action=None):
# 		print('player',player,'is moving')
# 		raise SwitchPhase('ExamplePhase', stack=False)
#
# 	def encode(self, C):
# 		out = GameActions('Make a move!')
# 		with out('moves', desc='Move Options'):
# 			out.add(tset(['yes','no']))
# 		return tdict({self.player: out})
#


from gsm import GamePhase, GameActions, GameOver
from gsm.common import TurnPhase
from gsm import SwitchPhase
from gsm import tset, tdict, tlist


class ExamplePhase(TurnPhase):

	def execute(self, C, player=None, action=None):
		if action is not None:
			loc, = action
			C.log.writef('{} chooses {}', player, loc)

			raise SwitchPhase('ExamplePhase', stack=False)

	def encode(self, C):
		out = GameActions('Place a tick into one of free spots')
		with out('tic', desc='Available spots'):
			out.add(tset(['a','b']))
		return tdict({self.player: out})



