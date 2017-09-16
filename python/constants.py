import operator

### Validated for KASware3

d_repeats = {'R000':'Never',
			 'R001':'Always',
			 'R002':'X days',
			 'R007':'Week',
			 'R030':'Month',
			 'R365':'Year'}

l_months = [ 
	[1, 'January'], 
	[2, 'February'],
	[3, 'March'],
	[4, 'April'],
	[5, 'May'],
	[6, 'June'],
	[7, 'July'],
	[8, 'August'],
	[9, 'September'],
	[10, 'October'],
	[11, 'November'],
	[12, 'December']
]

d_KASware3 = {
	'Actions':[
		['Proactive', 'Proactive action'], 
		['Reactive', 'Reactive action'], 
		['Negative', 'Negative action']
	]
}

l_weekdays = [
	['mon', 'Mon'], 
	['tue', 'Tue'], 
	['wed', 'Wed'], 
	['thu', 'Thu'], 
	['fri', 'Fri'], 
	['sat', 'Sat'], 
	['sun', 'Sun'],
]

l_repeatdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']




#########
def removeNumbers(tupleList, start):
	result = []
	for e in tupleList:
		result.append((e[0],e[1][start:]))		
	return result

def makeDictionaryFromTupleList(tupleList):
	result = {}
	for e in tupleList:
		result[e[0]] = e[1]		
	return result


l_Fibonacci = [0.25,1,2,3,5,8,13]
l_Fibonacci_1_8 = [1,2,3,5,8]
d_attributeType = {

	'description':'string',
	'secondary_description':'string',

	'comments':'string',
	'ksu_type':'string',
	'ksu_subtype':'string',
	'parent_id':'ndb_key',
	'effort_denominator':'integer',
	'wish_type': 'string',


	'importance':'integer',
	'mission_importance':'integer',
	'tags':'user_tags',
	'parent_id':'parent_id', 	

	'kpts_value':'float',
	'is_special':'checkbox',

	'is_active': 'checkbox',
	'is_critical': 'checkbox',
	'is_private': 'checkbox',

	'next_event':'date',
	'frequency':'integer',

	'repeats':'string',		
	'repeats_on_Mon':'checkbox_repeats_on',
	'repeats_on_Tue':'checkbox_repeats_on', 
	'repeats_on_Wed':'checkbox_repeats_on',
	'repeats_on_Thu':'checkbox_repeats_on',
	'repeats_on_Fri':'checkbox_repeats_on',
	'repeats_on_Sat':'checkbox_repeats_on',
	'repeats_on_Sun':'checkbox_repeats_on',
	'best_time':'time',

	# 'target':'tbd', # its a json For ksus that generate kpts and indicators target min, target max, reverse target etc
	'mission_view':'string',
	'birthday': 'date',
	'money_cost': 'dict_cost',
	'days_cost': 'dict_cost',
	'hours_cost': 'dict_cost',
	'is_mini_o': 'checkbox',
	'is_jg': 'checkbox'
	}

default_ksu = {}
d_SetTitles = {
	'':'My Theory',
	'Today':"Today's Mission",
	'Upcoming':'Upcoming',
	'Graveyard':'Graveyard',
	'BigOPlan': 'BigO Plan',
	'TheoryQuery': 'Theory Query',
	'Dashboard': 'Dashboard',

	'SomedayMaybe': 'Someday Maybe', 
	'Gene': 'In-Basket',
	'KeyA': 'Core Actions',
	'BOKA': 'Objective Plan',
	'BigO': 'Objectives',
	'Wish': 'Dreams & Wishes',
	'EVPo': 'Joy Generators',
	'ImPe': 'Important People',
	'Idea': 'Principles',
	'RTBG': 'Reasons To Be Grateful',
	'ImIn': 'Indicators',
	'Diary':'Diary'}

d_KsuTypes = {
	'Gene': '00. Unassigned',
	'OTOA': '01. One Time Only Action',
	'KeyA': '02. Key Action', 
	'BigO': '03. Objective',
	'Wish': '04. Wish',
	'Idea': '05. Principle',
	'EVPo': '06. Joy Generator',
	'ImPe': '07. Important Person',
	
	'RTBG': '08. Reason To Be Grateful',
	'Diary':'09. Diary Entry',
	'ImIn': '10. Indicator'}
l_KsuTypes = sorted(d_KsuTypes.items(), key=operator.itemgetter(1))
l_KsuTypes = removeNumbers(l_KsuTypes, 4)
d_KsuTypes = makeDictionaryFromTupleList(l_KsuTypes)
d_KsuSubtypes = {
	'Gene':'Unassigned',
	'KeyA':'Key Action',
	'KAS1':'Key Proactive Action',
	'KAS2':'One Time Only Action',
	'KAS3':'Key Reaction',
	'KAS4':'Key Action To Avoid',

	'BigO': 'Big Objective',
	'MiniO': 'Mini Objective',

	'Wish': 'Wish',
	'EVPo': 'Joy Generator',
	'ImPe': 'Important Person',
	'Idea': 'Principle',
	'RTBG': 'Reason To Be Grateful',

	'Diary': 'Diary Entry',
	'ImIn': 'Indicator',
	'RealitySnapshot':'Reality Indicator',
	'BinaryPerception': 'Binary Perception Indicator',
	'TernaryPerception': 'Ternary Perception Indicator',
	'FibonacciPerception': 'Fibonacci Perception Indicator'} 






l_repeats = sorted(d_repeats.items())

d_Days = {'None':'None',
		  '1':'1. Sunday',
		  '2':'2. Monday',
		  '3':'3. Tuesday',
		  '4':'4. Wednesday',
		  '5':'5. Thursday',
		  '6':'6. Friday',
		  '7':'7. Saturday'}
l_Days = sorted(d_Days.items())
d_repeats_legend = {
	'R000':'',
	'R001':'Days',
	'R007':'Weeks',
	'R030':'Months',
	'R365':'Years'}

d_MissionViews = {
	'KickOff':'Kick Off',
	'Principal':'Principal',
	'WrapUp':'Wrap Up'
}

l_MissionViews = [
	'Principal',
	'Kick Off',
	'Wrap Up'
]


d_SetViewerDetails = {
	
	'Gene':{'buttons_col':0},

	'KeyA':{
		'QuickAdd':{'description':'Describe your new Key Action'},
		'buttons_col':2},

	'KAS1':{
		'attributes': ['pretty_next_event'],
		'fields': {'pretty_next_event':'Next Event'},
		'columns':{'pretty_next_event':6},
		'detailsLabel':'Effort Reward',
		'buttons_col':3,
		'buttons':['Done', 'SendToMission'],

		#Master template parameters
		'Mission':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'},

		'Set':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},
	
	'KAS2':{		
		'attributes': ['pretty_next_event'],
		'fields': {'pretty_next_event':'Scheduled for'},
		'columns':{'pretty_next_event':6},
		'detailsLabel':'Effort Reward',
		'buttons_col':2,
		'buttons':['Done', 'SendToMission'],

		#Master template parameters
		'Mission':{
			'heading_exists': True,
			'heading_visible': True,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'What is the next step?'},

		'Set':{
			'heading_exists': True,
			'heading_visible': True,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'What is the next step?'}},
	
	'BOKA':{
		'QuickAdd':{'description':'What do you need to do to achieve your Objective?'},		
		'attributes': ['pretty_next_event'],
		'fields': {'pretty_next_event':'Scheduled for'},
		'columns':{'pretty_next_event':6},
		'detailsLabel':'Effort Reward',
		'buttons_col':2,
		'buttons':['Done', 'SendToMission']},

	'KAS3':{
		'attributes': ['kpts_value'],
		'fields': {'kpts_value':'Reward (Kpts.)'},
		'columns': {'kpts_value':6},
		'buttons_col':2,
		'detailsLabel':'Effort Reward',
		'buttons': ['Done'],

		#Master template parameters
		'Mission':{
			'heading_exists': True,
			'heading_visible': True,
			'heading_style': 'color:#32CD32; font-weight:bold; font-size:12px;',
			'heading_content': 'Target Reaction:',

			'top_sec_desc_exists': True,
			'top_sec_desc_visible': True,
			'top_sec_desc_style': 'ont-weight:normal; font-style:italic;',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': 'font-weight:bold;',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'},

		'Set':{
			'heading_exists': True,
			'heading_visible': True,
			'heading_style': 'color:#32CD32; font-weight:bold; font-size:12px;',
			'heading_content': 'Target Reaction:',

			'top_sec_desc_exists': True,
			'top_sec_desc_visible': True,
			'top_sec_desc_style': 'ont-weight:normal; font-style:italic;',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': 'font-weight:bold;',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},

	'KAS4':{
		'attributes': ['kpts_value'],
		'fields': {'kpts_value':'Punishment (Kpts.)'},
		'columns':{'kpts_value':6},
		'detailsLabel':'Stupidity Punishment',
		'buttons_col':2,
		'buttons':['Done'],

		#Master template parameters
		'Mission':{
			'heading_exists': True,
			'heading_visible': True,
			'heading_style': 'color:red; font-weight:bold; font-size:12px;',
			'heading_content': 'Must avoid: ',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': 'font-weight:bold;',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'},

		'Set':{
			'heading_exists': True,
			'heading_visible': True,
			'heading_style': 'color:red; font-weight:bold; font-size:12px;',
			'heading_content': 'Must avoid: ',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': 'font-weight:bold;',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},					

	'BigO':{
		'QuickAdd':{
			'description':'What do you want to achieve?',
			'secondary_description':'Define success (e.g. $1,000,000 in my bank acount)'},				
		'attributes': ['pretty_next_event'],
		'fields': {'pretty_next_event':'Target Date'},
		'columns':{'pretty_next_event':6},
		'detailsLabel':'',
		'buttons_col':2,
		'buttons':['Done'],

		#Master template parameters
		'Mission':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': 'font-weight:bold;',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'color:grey; font-style:italic;',
			'bot_sec_desc_placeholder': 'This is a placeholder'},		

		'Set':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': 'font-weight:bold;',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'color:grey; font-style:italic;',
			'bot_sec_desc_placeholder': 'Success definition'}},	

	'Wish':{
		'QuickAdd':{'description':'What do you wish for?'}, 		
		'attributes': ['money_cost'],
		'fields': {'money_cost':'Money required ($)'},
		'columns':{'money_cost':6},
		'detailsLabel':'',
		'buttons_col':1,
		'buttons':['Done'],

		#Master template parameters
		'Mission':{
			'heading_exists': True,
			'heading_visible': True,
			'heading_style': 'color: purple; font-weight: bold;',
			'heading_content': 'Dream: ',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'},		

		'Set':{
			'heading_exists': True,
			'heading_visible': True,
			'heading_style': 'color: purple; font-weight: bold;',
			'heading_content': 'Dream: ',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},	

	'EVPo': { 
		'QuickAdd':{
			'description':'Describe your new Joy Generator',
			'secondary_description':'Trigger action description (e.g. buy movie tickets")'
			},		
		'attributes': ['frequency'],
		'fields': {'frequency':'Charging time (days)'},
		'columns':{'frequency':6},
		'detailsLabel':'Trigger Effort Reward',
		'buttons_col':3,
		'buttons':['Done', 'SendToMission'],

		#Master template parameters
		'Mission':{
			'heading_exists': True,
			'heading_visible': True,
			'heading_style': 'color:purple; font-weight:bold;',
			'heading_content': 'Just for joy:',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'},

		'Set':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},

	'ImPe': { 
		'QuickAdd':{
			'description':'Who is your new Important Person?'},		
		'attributes': ['frequency'], 
		'fields': {'frequency':'Contact Frequency (days)'},
		'columns':{'frequency':6},
		'detailsLabel':'Contract Effort Reward',
		'buttons_col':3,
		'buttons':['Done', 'SendToMission'],

		#Master template parameters
		'Mission':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': False,
			'description_visible': False,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'},

		'Set':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},

	'Idea': {
		'QuickAdd':{'description':'What are your Principles?'}, 		
		'attributes': ['source'],
		'fields': {'source':'Source'},
		'columns':{'source':6},
		'detailsLabel':'',
		'buttons_col':0,
		'buttons':[],

		#Master template parameters
		'Mission':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'},

		'Set':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},	

	'RTBG': { 
		'QuickAdd':{'description':'What are you greateful for?'},		
		'attributes': [],
		'fields': {},
		'columns':{},
		'detailsLabel':'',
		'buttons_col':0,
		'buttons':[],

		#Master template parameters
		'Mission':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'},			

		'Set':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': False,
			'bot_sec_desc_visible': False,
			'bot_sec_desc_style': '',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},

	'ImIn': { 
		'QuickAdd':{
			'description':'What is your new Indicator?',
			'secondary_description': 'Data generating question (e.g. Whats my weight?'},		
		'attributes': [], 
		'fields': {},
		'columns':{},
		'detailsLabel':'',
		'buttons_col':0,
		'buttons':[]},

	'BinaryPerception': { 		
		'attributes': ['pretty_next_event'],
		'fields': {'pretty_next_event':'Next Question'},
		'columns':{'pretty_next_event':6},
		'detailsLabel':'',
		'buttons_col':0,
		'buttons':['Record'],

		#Master template parameters
		'Mission':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': False,
			'description_visible': False,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'font-weight: bold;margin-bottom: 10px;',
			'bot_sec_desc_placeholder': 'This is a placeholder'},

		'Set':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': 'font-weight:bold;',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'color: grey; font-style:italic;',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},

	'TernaryPerception': { 		
		'attributes': ['pretty_next_event'],
		'fields': {'pretty_next_event':'Next Question'},
		'columns':{'pretty_next_event':6},
		'detailsLabel':'',
		'buttons_col':0,
		'buttons':['Record'],

		#Master template parameters
		'Mission':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': False,
			'description_visible': False,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'font-weight: bold;margin-bottom: 10px;',
			'bot_sec_desc_placeholder': 'This is a placeholder'},

		'Set':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': 'font-weight:bold;',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'color: grey; font-style:italic;',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},	

	'FibonacciPerception': { 		
		'attributes': ['pretty_next_event'],
		'fields': {'pretty_next_event':'Next Question'},
		'columns':{'pretty_next_event':6},
		'detailsLabel':'',
		'buttons_col':0,
		'buttons':['Record'],

		#Master template parameters
		'Mission':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': False,
			'description_visible': False,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'font-weight: bold;margin-bottom: 10px;',
			'bot_sec_desc_placeholder': 'This is a placeholder'},

		'Set':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': 'font-weight:bold;',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'color: grey; font-style:italic;',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},	

	'RealitySnapshot': { 		
		'attributes': ['pretty_next_event'],
		'fields': {'pretty_next_event':'Next Question'},
		'columns':{'pretty_next_event':6},
		'detailsLabel':'',
		'buttons_col':0,
		'buttons':['Record'],

		#Master template parameters
		'Mission':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': False,
			'description_visible': False,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'font-weight: bold;margin-bottom: 10px;',
			'bot_sec_desc_placeholder': 'This is a placeholder'},

		'Set':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': 'font-weight:bold;',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'color: grey; font-style:italic;',
			'bot_sec_desc_placeholder': 'This is a placeholder'}},	

	'Diary': { 
		'QuickAdd':
			{'description':'What is your new Diary section?',
			'secondary_description':'Entry question (e.g. What was the best part of my day today?)'},		
		'attributes': [], 
		'fields': {},
		'columns':{},
		'detailsLabel':'',
		'buttons_col':0,
		'buttons':['Record'],
		
		#Master template parameters
		'Mission':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': False,
			'description_visible': False,
			'description_style': '',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'font-weight: bold;margin-bottom: 10px;',
			'bot_sec_desc_placeholder': 'This is a placeholder'},

		'Set':{
			'heading_exists': False,
			'heading_visible': False,
			'heading_style': '',
			'heading_content': '',

			'top_sec_desc_exists': False,
			'top_sec_desc_visible': False,
			'top_sec_desc_style': '',
			'top_sec_desc_placeholder': 'This is a placeholder',	

			'description_exists': True,
			'description_visible': True,
			'description_style': 'font-weight:bold;',
			'description_placeholder': 'This is a placeholder',

			'bot_sec_desc_exists': True,
			'bot_sec_desc_visible': True,
			'bot_sec_desc_style': 'color: grey; font-style:italic;',
			'bot_sec_desc_placeholder': 'This is a placeholder'}}
}

d_HistoryViewer = {
	# 'Undefined':'What the fuck?',		
	'KAS1':'Proactive effort',
	'KAS2':'Proactive effort',
	'KAS3':'Reactive effort',
	'KAS4':'Stupidity commited',

	'BigO': 'Objective Achieved',
	'Wish': 'Wish granted',
	'EVPo': 'Joy effort',
	'ImPe': 'Relationship effort',
	'Idea': '',
	'RTBG': '',

	'Diary': 'Diary Entry',
	'RealitySnapshot':'Reality Indicator Measurement',
	'BinaryPerception': 'Binary Perception Indicator Measurement',
	'TernaryPerception': 'Ternary Perception Indicator Measurement',
	'FibonacciPerception': 'Fibonacci Perception Indicator Measurement'
}


ksu_for_template = {

	'theory': None,
	'created': None,
	'last_modified': None,

	'description': '',
	'secondary_description': '',

	'comments': '',
	'ksu_type': '',
	'ksu_subtype': '',
	'kpts_value': 0,

	'importance': 3,
	'mission_importance': 3,
	'tags': None,
	'parent_id': None,
		
	'is_active': True,
	'is_critical': False,
	'is_private': False,

	'is_visible': True,
	'in_graveyard': False,
	'is_deleted': False,

	'next_event': None,
	'pretty_next_event': '',
	'frequency': 1, 
	'repeats': '',
	'repeats_on': {},
	
	'mission_view': 'Principal',
	'best_time': None,
	'pretty_best_time': '',

	'is_mini_o': False,
	'target': {},
	'birthday': None,
	'money_cost': 0,

	'cost':{'money_cost': 0, 'days_cost': 0, 'hours_cost': 0},
	'timer':{},
	'ImIn_details':{'positive_label':'Delighted', 'neutral_label':'Satisfied', 'negative_label':'Dissapointed', 'units': 'Units'},

	'picture': None,
	'times_reviewed': 0,
	'description_rows':1,
	'secondary_description_rows':1,
	'timer':{'hours':0, 'minutes':0, 'seconds':0, 'value':'00:00:00'}
}


type_to_subtypes = {
	'Graveyard':[],
	'TheoryQuery':[],
	'KeyA':['KAS1', 'KAS2', 'KAS3', 'KAS4'], 
	'OTOA':['KAS2'],
	'BigO':['BigO'],
	'BOKA':['KAS2'],
	'Wish':['Wish'],
	'Idea':['Idea'],
	'RTBG':['RTBG'],
	'ImPe':['ImPe'],
	'EVPo':['EVPo'],
	'Diary':['Diary'],
	'ImIn':['FibonacciPerception', 'BinaryPerception' , 'RealitySnapshot', 'TernaryPerception']	
}

# subtype_to_type = {
# 	'KAS1':'KeyA', 
# 	'KAS2':, 
# 	'KAS3':, 
# 	'KAS4':, 
# 	'BigO':,
# 	'Wish':,
# 	'Idea':,
# 	'RTBG':,
# 	'ImPe':,
# 	'EVPo':,
# 	'Diary':,
# 	'FibonacciPerception':,
# 	'BinaryPerception':, 
# 	'RealitySnapshot':]	
# }


d_displayValues = {}
d_displayValues.update(d_repeats)

constants = {'l_Fibonacci':l_Fibonacci,
			 'l_Fibonacci_1_8':l_Fibonacci_1_8,
			 'd_attributeType':d_attributeType,
			 'default_ksu':default_ksu,
			 'd_SetTitles':d_SetTitles,

			 'd_KsuTypes':d_KsuTypes,
			 'l_KsuTypes':l_KsuTypes,
			 'd_KsuSubtypes':d_KsuSubtypes, 

			 'd_repeats': d_repeats,
			 'l_repeats':l_repeats,
			 'l_months':l_months,

			 'l_repeatdays': l_repeatdays,
			 'l_weekdays': l_weekdays,
			 'l_Days':l_Days,
			 'd_repeats_legend':d_repeats_legend,
			 
			 'd_SetViewerDetails':d_SetViewerDetails,
			 'd_displayValues':d_displayValues,
			 'd_HistoryViewer':d_HistoryViewer,

			 'ksu_for_template': ksu_for_template,
			 'type_to_subtypes':type_to_subtypes,
			 'd_KASware3': d_KASware3}




			 