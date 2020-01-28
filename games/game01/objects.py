from gsm import GameObject, tdict, tlist, tset
from gsm.mixins import Named
from gsm.common.world import grid
from gsm.common.elements import Card as CardBase
from gsm.common.elements import Deck

class Card(Named, CardBase):
	def isroyal(self):
		return '_royal' in self

class Deck_WA(Deck):
	def _peek(self):
		if self._top_face_up is not None:
			self.next = tlist(list(self._objs._data)[:self._top_face_up])

class DiscardPile(Deck_WA):
	def __init__(self, seed, default, top_face_up):
		super().__init__(cards=tlist(), seed=seed, default=default,
		                 top_face_up=top_face_up)

class DrawPile(Deck_WA):
	def __init__(self, discard_pile, log, **props):
		super().__init__(_discard_pile=discard_pile, _log=log, **props)
	
	def draw(self, n=None, player=None):
		num = 1 if n is None else n
		if len(self) < num:
			self.refill()
		return super().draw(n=n, player=player)
	
	def refill(self):
		self._log.write('Refilling {} with {}', self, self._discard_pile)
		raise NotImplementedError
		self.shuffle()
