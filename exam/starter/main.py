import os
import gsm
from gsm import tdict, tlist
from .phases import Phase1
from gsm.common import TurnPhaseStack

MY_PATH = os.path.dirname(os.path.abspath(__file__))

class Starter(gsm.GameController):
	
	def __init__(self, player_names=['Player1', 'Player2'], debug=False):
		
		super().__init__(debug=debug,stack = TurnPhaseStack(), info_path=os.path.join(MY_PATH, 'info.yaml'))
		
		# register config files
		self.register_config('basic', os.path.join(MY_PATH,'config/basics.yaml'))
		
		# register players
		assert len(player_names) == 2, 'Not the right number of players'
		self.register_player(player_names[0], val=1)
		self.register_player(player_names[1], val=-1)
		
		# register game object types
		self.register_obj_type(name='gameObject1')

		# register possible phases
		self.register_phase(name='phase1', cls=Phase1)
	
	def _set_phase_stack(self, config):
		self.stack.set_player_order(tlist(self.players))
		return tlist(['phase1'])
	
	def _select_player(self):
		return next(iter(self.players))
	
	def _init_game(self, config):
		pass

	def _end_game(self):
		val = self.state.winner
		print(val)

gsm.register_game(Starter, os.path.join(MY_PATH, 'info.yaml'))
