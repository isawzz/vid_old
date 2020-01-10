
import numpy as np

from gsm import GameObject
from gsm.common.world import Grid, Field


class Board(Grid):

	def checkLimited(self, lim):
		#lim = 3
		size = self.map.shape[0]

		for i in range(0,size-lim):
			for r in range(0,size):
				print(self.map[r,i])
				print(self.map[r][i])

				sum1 = 0
				for k in range(i,i+lim):
					sum1 += self.map[r,k]._val
				print(sum1)
				if sum1 == lim:
					return 1
				elif sum1 == -lim:
					return -1

				sum1 = 0
				for k in range(i,i+lim):
					sum1 += self.map[k,r]._val
				print(sum1)
				if sum1 == lim:
					return 1
				elif sum1 == -lim:
					return -1




		return 0

	def check(self):
		L = self.map.shape[0]
		
		# check rows
		sums = self.map.sum(0)
		
		if (sums == L).any():
			return 1
		elif (sums == -L).any():
			return -1
		
		# check cols
		sums = self.map.sum(1)
		
		if (sums == L).any():
			return 1
		elif (sums == -L).any():
			return -1
		
		# check diag
		diag = np.diag(self.map).sum()
		if diag == L:
			return 1
		elif diag == -L:
			return -1
		
		diag = np.diag(np.fliplr(self.map)).sum()
		if diag == L:
			return 1
		elif diag == -L:
			return -1
		
		return 0
		
	def get_free(self):
		free = self.map == 0
		return self.map[free]


class Tick(Field):
	def __init__(self, **props):
		super().__init__(**props)
		
		self._val = 0
		
	def __eq__(self, other):
		try:
			return self._val == other._val
		except AttributeError:
			return self._val == other

	def __hash__(self):
		return super().__hash__()

	def __add__(self, other):
		try:
			return self._val + other._val
		except AttributeError:
			return self._val + other
		
	def __radd__(self, other):
		return self.__add__(other)
		
	def __str__(self):
		return '({},{})'.format(self.row, self.col)