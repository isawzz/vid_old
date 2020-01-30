from gsm import GameObject, tdict, tlist, tset
from gsm.mixins import Named
from gsm.common.elements import Card as CardBase
from gsm.common.elements import Deck

class Card(Named, CardBase):
	def __init__(self, **props):
		super().__init__(**props)
		self.generic_type = 'card'
		print('made a card')

	def isroyal(self):
		return '_royal' in self
	
# class DiscardPile1(Deck):
# 	pass ###
#
# class DiscardPile2(Deck):
# 	def __init__(self, seed, default, top_face_up, **info):
# 		super().__init__(cards=tlist(), seed=seed, default=default,
# 		                 top_face_up=top_face_up, **info)
#
# #WORKS!!!!!!!!!!!!!!!!
# class DiscardPile3(Deck):
# 	def __init__(self, seed, default, cards=[], top_face_up=None, **info):
# 		super().__init__(seed=seed, default=default, cards=cards, top_face_up=top_face_up, **info)

class Deck_WA(Deck):
	def __init__(self, **props):
		super().__init__(**props)
		self.deck_count = len(self)
		self.generic_type = 'deck'
		print('deck has',self.deck_count,'cards')

	def _peek(self):
		if self._top_face_up is not None:
			self.next = tlist(list(self._objs._data)[:self._top_face_up])

class DiscardPile(Deck_WA):
	def __init__(self, seed, default, top_face_up=None, **info):
		super().__init__(seed=seed, default=default, cards=[], top_face_up=top_face_up, **info)

class DrawPile(Deck_WA):
	def __init__(self, discard_pile, log, **props):
		super().__init__(_discard_pile=discard_pile, _log=log, **props)
	
	def draw(self, n=None, player=None):
		num = 1 if n is None else n
		if len(self) < num:
			self.refill()
		cardset=super().draw(n=n, player=player)
		for c in cardset:
			c.visible = tset([player])
		return cardset
	
	def refill(self):
		self._log.write('Refilling {} with {}', self, self._discard_pile)
		raise NotImplementedError
		self.shuffle()
	

class Building(GameObject):
	def __init__(self, address, owner, **props):
		super().__init__(harvest=None, owner=owner,
		                 address=address, intruders=tlist(),
		                 **props)

	def visit(self):
		raise NotImplementedError


class Market(GameObject):
	
	def clear(self):
		self.neutral.clear()
	
	def reset(self, num): #hier wird neutral market aufgefuellt! just a set of cards
		
		cards = self._deck.draw(num)
		
		self._log.write('The neutral market is: {}'.format(', '.join(['{}'] * num)), *cards)
		
		self.clear()
		self.neutral.update(cards)
