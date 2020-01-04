
from gsm import tset, tlist, tdict
from gsm.common.world import grid

def get_outside_corners(field): # start corner must be N of the field at seam "1"
	
	def get_next(options, prev):
		for x in options:
			if x is not None and x != prev and None in x.fields:
				return x
		raise Exception('No next found')
	
	start = field.corners[0]
	e = field.edges[0]
	
	x1, f, x2 = start.fields
	assert f == field and x1 is None and x2 is None, 'Not the right corner'
	
	corners = tlist([start])
	
	c = get_next(e.corners, start)
	while c != start:
		corners.append(c)
		e = get_next(c.edges, e)
		c = get_next(e.corners, c)
		
	return corners
	

def build_catan_map(G, hex_info, ports, number_info, RNG):
	
	start_field = None
	for field in G.fields:
		if field.val == 'A':
			start_field = field
	assert start_field is not None, 'could not find the start field'
	
	outside = get_outside_corners(start_field)

	for idx, port_type in ports.items():
		outside[idx].port = port_type
		
	# set hex types
	hextypes = tlist()
	for res, num in hex_info.items():
		hextypes.extend([res]*num)
	
	RNG.shuffle(hextypes)
	
	for field, hextype in zip(G.fields, hextypes):
		field.res = hextype
		del field.val
	
	hinums = number_info.hi
	
	options = tlist(f for f in G.fields if f.res != 'desert')
	assert len(options) == (len(number_info.hi) + len(number_info.reg)), 'not the right number of tiles'
	remaining = tset()
	
	for num in hinums:
		
		idx = RNG.randint(0, len(options)-1)
		
		f = options[idx]
		f.num = num
		
		options.remove(f)
		for n in f.neighbors:
			if n is not None and n in options:
				remaining.add(n)
				options.remove(n)
	
	remaining.update(options)
	
	regnums = number_info.reg
	RNG.shuffle(regnums)
	
	for f, num in zip(remaining, regnums):
		f.num = num

def roll_dice(rng):
	return rng.randint(1,6) + rng.randint(1,6)

def pay_cost(player, cost, bank):
	for res, num in cost.items():
		gain_res(res, bank, player, -num)

def gain_res(res, bank, player, delta, log=None):
	
	if delta > 0 and bank[res] < delta:
		delta = bank[res]
		
		if log is not None and delta == 0:
			log.writef('Bank is out of {}.', res)
			return
	
	bank[res] -= delta
	player.resources[res] += delta
	player.num_res += delta
	
	change = ' gains ' if delta > 0 else ' loses '
	if log is not None:
		log.writef('{} {} {} {}.', player, change, abs(delta), res)
	
	if log is not None and bank[res] == 0:
		log.writef('Bank ran out of {}.', res)

def get_knight(devcards):
	
	for card in devcards:
		if card.name == 'Knight':
			return card
	return None

def play_dev(player, card):
	player.devcards.remove(card)
	card.face_up()
	player.past_devcards.add(card)

def steal_options(loc, player):
	return tset(c.building.player for c in loc.corners
	            if 'building' in c
	                and c.building.player != player
	                and c.building.player.num_res > 0)

def _settle_available(loc):
	for e in loc.edges:
		if e is not None:
			for c in e.corners:
				if 'building' in c:
					return False
	return True
def _payable(player, cost):
	for res, num in cost.items():
		if player.resources[res] < num:
			return False
	return True
def check_building_options(player, costs):
	
	locs = tdict(
		road=tset(),
		settlement=tset(),
		city=tset(),
	)
	
	for road in player.buildings.road:
		for c in road.loc.corners:
			if 'building' not in c:
				if _settle_available(c):
					locs.settlement.add(c)
			elif c.building.player == player:
				if c.building.get_type() == 'settlement':
					locs.city.add(c.building)
			else:
				continue
			for e in c.edges:
				if e is not None and 'building' not in e:
					locs.road.add(e)
	
	options = tdict()
	for bld, opts in locs.items():
		if _payable(player, costs[bld]) and player.reserve[bld] > 0:
			options[bld] = opts
	
	return options

def can_buy(player, cost):
	hand = player.resources
	for res, num in cost.items():
		if hand[res] < num:
			return False
	return True

def build(C, bldname, player, loc, silent=False):
	bld = C.table.create(bldname, loc=loc, player=player)
	loc.building = bld
	player.buildings[bldname].add(bld)
	player.reserve[bldname] -= 1
	
	if 'port' in loc:
		player.ports.add(loc.port)
	
	reward = C.state.rewards[bldname]
	player.vps += reward
	if not silent:
		msg = None
		if reward == 1:
			msg = ' (gaining 1 victory point)'
		if reward > 1:
			msg = ' (gaining {} victory points)'.format(reward)
		C.log.writef('{} builds a {}{}', player, bld, '' if msg is None else msg)
	return bld

def unbuild(C, bld, silent=False):
	C.table.remove(bld)
	player = bld.player
	loc = bld.loc
	
	del loc.building
	player.buildings[bld.obj_type].remove(bld)
	player.reserve[bld.obj_type] += 1
	
	if 'port' in loc:
		player.ports.discard(loc.port)
	
	reward = C.state.rewards[bld.obj_type]
	player.vps -= reward
	if not silent:
		msg = None
		if reward == 1:
			msg = ' (losing 1 victory point)'
		if reward > 1:
			msg = ' (losing {} victory points)'.format(msg)
		C.log.writef('{} removes a {}{}', player, bld, '' if msg is None else msg)

def bank_trade_options(player, bank_trading):
	bank_options = tdict()
	default = bank_trading['3to1'] if '3to1' in player.ports else bank_trading.default
	for res, num in player.resources.items():
		ratio = bank_trading[res] if res in player.ports else default
		if num >= ratio:
			bank_options[res] = ratio
	
	return bank_options

def execute_trade(offer, demand, bank, from_player, to_player=None, log=None):
	# gain_res(res, bank, player, delta, log=None)
	
	offer_res = tlist()
	demand_res = tlist()
	
	for res in offer.keys():
		
		if offer[res] > 0:
			offer_res.extend([res]*offer[res])
			gain_res(res, bank, from_player, -offer[res])
			if to_player is not None:
				gain_res(res, bank, to_player, offer[res])
		if demand[res] > 0:
			demand_res.extend([res]*demand[res])
			if to_player is not None:
				gain_res(res, bank, to_player, -demand[res])
			gain_res(res, bank, from_player, demand[res])
		
	if log is not None:
		
		if to_player is None:
			log.writef('{} trades with the bank:', from_player)
			log.iindent()
			log.writef('Paying {} {}', len(offer_res), offer_res[0])
			log.writef('Receiving 1 {}', demand_res[0])
			log.dindent()
		else:
			log.writef('{} trades with {}:', from_player, to_player)
			log.iindent()
			log.writef('Paying: {}', ', '.join(offer_res) if len(offer_res) else '-nothing-')
			log.writef('Receiving: {}', ', '.join(demand_res) if len(demand_res) else '-nothing-')
			log.dindent()
			

def check_victory(C):
	req = C.state.victory_condition
	for player in C.players:
		if player.vps >= req:
			return True
	return False

def trade_available(player, demand):
	for res in demand.keys():
		if player.resources[res] < demand[res]:
			return False
	return True
	


