from gsm import GamePhase, GameActions, GameOver
from gsm.common import TurnPhase
from gsm import SwitchPhase, PhaseComplete
from gsm import tset, tdict, tlist

class RoyalPhase(TurnPhase):
	
	def execute(self, C, player=None, action=None):
		
		if 'pre_complete' not in self:
			C.log.writef('{} phase begins', self.name.capitalize())
			C.log.iindent()
			self.pre_complete = True
			self.sel = tdict({p:tset() for p in C.players})
			self.active = tset(C.players)
			
			# create neutral market
			num = 5 #C.config.rules.neutral_market[self.name]
			if num > 0:
				cards = C.state.deck.draw(num)
				
			# draw cards
			num = 3
			if num > 0:
				C.log.write('Everybody draws {} card{}'.format(num, 's' if num > 1 else ''))
				for p in C.players:
					cards = C.state.deck.draw(num, player=player)
					C.log[p].writef('You draw: {}'.format(', '.join(['{}']*num)), *cards)
					p.hand.add(cards)

		if action is not None:
			obj, = action
			
			if 'ready' == obj:
				self.active.remove(player)
				if len(self.active) == 0:
					self.market_complete = True
					
					nxt = 1
					if nxt is not None:
						for p, cards in self.sel:
							for card in cards:
								p.hand.remove(card)
							p.market = cards
						
						raise SwitchPhase('phase2', player=nxt, market=self.sel)
					else:
						C.log.write('No one goes to the market')
						
			elif obj in self.sel[player]:
				C.log[player].iindent()
				C.log[player].writef('You unselect {}', obj)
				C.log[player].dindent()
				self.sel[player].remove(obj)
			else:
				C.log[player].iindent()
				C.log[player].writef('You select {}', obj)
				C.log[player].dindent()
				self.sel[player].add(obj)
			
		if 'market_complete' in self:
			self.post_complete = True

		if 'post_complete' in self:
			C.state.market.clear()
			if len(C.stack) == 0:
				C.stack.extend(C.state.royal_phases)
				C.log.zindent()
			raise PhaseComplete
		
	def encode(self, C):
		
		full = tdict()
		
		for player in self.active:
			out = GameActions('Select what cards to bring to the market')
		
			with out('select', 'Select card'):
				opts = player.hand - self.sel[player]
				if len(opts):
					out.add(opts)
			
			with out('unselect', 'Unselect card'):
				if len(self.sel[player]):
					out.add(self.sel[player])
			
			with out('ready', 'Ready for the market'):
				out.add('ready')
		
			full[player] = out
		
		return full

class ExamplePhase(TurnPhase):

	def execute(self, C, player=None, action=None):
		if action is not None:
			loc, = action
			C.log.writef('{} chooses {}', player, loc)

			raise SwitchPhase('phase2', stack=False)

	def encode(self, C):
		out = GameActions('Play a card')
		with out('tic', desc='Available spots'):
			out.add(tset(['a','b']))
		return tdict({self.player: out})



