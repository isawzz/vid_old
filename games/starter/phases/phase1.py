
from gsm import GameActions, GameOver
from gsm import tset, tdict
from gsm import SwitchPhase
from gsm.common import TurnPhase


class Phase1(TurnPhase):
	
	def execute(self, C, player=None, action=None):

		if 'counter' not in C.state:
			C.state.counter = 0
		C.state.counter+=1
		if C.state.counter > 3:
			C.state.winner = 'Player1'
			raise GameOver
		raise SwitchPhase('phase1', stack=False)

	def encode(self, C):
		
		out = GameActions('Place a tick into one of free spots')
		
		free = C.state.board.get_free()
		
		with out('actionType1', desc='First kind of action'):
			out.add(tset({'a','b','c'}))
		
		with out('actionType2', desc='Second kind of action'):
			out.add(tset({1,2,3}))

		return tdict({self.player:out})


