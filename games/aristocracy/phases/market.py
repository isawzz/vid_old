
import numpy as np
from gsm import GameOver, GamePhase, GameActions, GameObject
from gsm import tset, tdict, tlist
from gsm import SwitchPhase, PhaseComplete

from gsm.common import TurnPhase

from ..ops import get_next_market

class MarketPhase(TurnPhase):
		
	def execute(self, C, player=None, action=None):
		
		if action is None:
			# self.neutrals = tset(C.deck.draw(C.config.rules.market_cards))
			self.num = len(self.market[self.player])
			# del self.sel[self.player]
			
			C.log.writef('{} may take {} action{}', self.player, self.num, 's' if self.num > 1 else '')
			
			return
		
		assert player == self.player, 'wrong player: {}'.format(player)
		
		obj, *other = action
		
		if 'trade' in self:
			
			pass
		
		else:
			self.num -= 1
			pass
		
		if self.num == 0:
			nxt = get_next_market(self.sel)
			if nxt is None:
				raise PhaseComplete
			else:
				raise SwitchPhase('market', stack=False, player=nxt, market=self.market[nxt])
		
		raise NotImplementedError
	
	def encode(self, C):
		
		# complete trade
		if 'trade' in self:
			out = GameActions('Choose second card to exchange')
			
			with out('cancel', 'Cancel trade'):
				out.add('cancel')
				
			with out('trade', 'Second card to exchange'):
				cards = tset()
				if self.trade not in C.state.market:
					cards.update(C.state.market)
				for p in C.players:
					if self.trade not in p.market:
						cards.update(p.market)
				out.add(cards)
				
		else:
			
			out = GameActions('You have {} actions left'.format(self.num))
			
			# trade
			# 1. can choose card from some other market
			# 2. can choose card from my own market
			# get cards from all markets except my own (self.player)
			with out('trade', 'Select card from other player markets'):
				for p, cards in self.market.items():
					if p == self.player and 'trade' not in self:
						continue
					elif 'trade' in self and p != self.player:
						continue
					opts = cards
					if len(opts):
						out.add(opts)
			print('market phase out',out)
			# pickup
			# can pickup card from my own market
			
			# play royal
			# can play any royal from my hand
			
			# royal action
			# can take action of current royal, let's say king
			
			# exchange building
			# 1. can pick up one card from one of my buildings
			# 2. pick one card from my market OR my hand
		
		return tdict({self.player: out})

