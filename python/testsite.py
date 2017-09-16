import math


def calculate_mission_reward(eod_merits, merits_goal):
	
	bracket_size = 30
	reward_factor = 1
	reward = 0

	range_end = eod_merits - merits_goal

	if range_end < 0:
		reward_factor = -1
		range_end = -range_end

	for merit in range(0, range_end):
		merit_reward = math.floor(merit/bracket_size) + 1
		reward += merit_reward

	return reward * reward_factor


def define_merits_goal(streak_day):

	goal_range = [
		[142, 160],
		[87, 150],
		[53, 140],
		[32, 130],
		[19, 120],
		[11, 110],
		[6, 100],
		[3, 90],
		[1, 80],
		[0, 70],	
	]

	for level in goal_range:
		if streak_day >= level[0]:
			return level[1]
	return 

print define_merits_goal(11)

