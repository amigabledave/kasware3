#KASware V2.0.0 | Copyright 2016 Kasware Inc.
# -*- coding: utf-8 -*-
import webapp2, jinja2, os, re, random, string, hashlib, json, logging, math 

from datetime import datetime, timedelta, time, date
from google.appengine.ext import ndb
from google.appengine.api import mail
from python import datastore, randomUser, constants, kasware_os, KASware3

from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.api import images

template_dir = os.path.join(os.path.dirname(__file__), 'html')
jinja_env = jinja2.Environment(loader = jinja2.FileSystemLoader(template_dir), autoescape = True)

constants = constants.constants
os_ksus = kasware_os.os_ksus

Theory = datastore.Theory
KSU = datastore.KSU
KSU3 = datastore.KSU3
Event = datastore.Event
Event3 = datastore.Event3
GameLog = datastore.GameLog

time_travel = 2 #TT Aqui le puedo hacer creer a la aplicacion que estamos en otro dia para ver como responde 


#--- Decorator functions
def super_user_bouncer(funcion):
	def user_bouncer(self):
		theory = self.theory
		if theory:
			return funcion(self)
		else:
			self.redirect('/SignUpLogIn')
		# return funcion(self)
	return user_bouncer


#-- Production Handlers
class Handler(webapp2.RequestHandler):
	def write(self, *a, **kw):
		self.response.out.write(*a, **kw)
	
	def render_html(self, template, **kw):
		t = jinja_env.get_template(template)
		theory = self.theory 
		if theory:				
			return t.render(theory=theory, **kw)
		else:
			return t.render(**kw)

	def print_html(self, template, **kw):	
		self.write(self.render_html(template, **kw))

	def set_secure_cookie(self, cookie_name, cookie_value):
		cookie_secure_value = make_secure_val(cookie_value)
		self.response.headers.add_header('Set-Cookie', '%s=%s; Path=/' % (cookie_name, cookie_secure_value))

	def read_secure_cookie(self, cookie_name):
		cookie_secure_val = self.request.cookies.get(cookie_name)
		return cookie_secure_val and check_secure_val(cookie_secure_val)

	def login(self, theory):
		self.set_secure_cookie('theory_id', str(theory.key.id()))

	def logout(self):
		self.response.headers.add_header('Set-Cookie', 'theory_id=; Path=/')

	def initialize(self, *a, **kw):
		webapp2.RequestHandler.initialize(self, *a, **kw)
		theory_id = self.read_secure_cookie('theory_id')
		self.theory = theory_id and Theory.get_by_theory_id(int(theory_id)) #if the user exist, 'self.theory' will store the actual theory object
		self.game_log = self.theory and self.update_game()

	def update_game(self):
		theory = self.theory
		game_log = GameLog.get_by_id(theory.game_log_key.id())
		
		game_log_user_date = game_log.user_date
		today = (datetime.today()+timedelta(hours=self.theory.timezone)+timedelta(days=time_travel)).replace(microsecond=0,second=0,minute=0,hour=0)

		if today > game_log_user_date: 

			print 
			print 'Todays date'
			print today
			print 'Game log user date'
			print game_log_user_date
			print

			self.check_n_burn(game_log)			
			days_gap = today.toordinal() - game_log_user_date.toordinal()

			for i in range(0, days_gap):
				game_log = self.create_new_game_log(game_log)	
				self.game_log = game_log

		return game_log 

	def check_n_burn(self, game_log):
		theory = self.theory
		critical_burn = 10
		game_log_user_date = game_log.user_date
		ksu_set = KSU3.query(KSU3.theory_id == theory.key).filter(KSU3.status == 'Critical').filter(KSU3.event_date != None).filter(KSU3.event_date <= game_log_user_date).fetch()
		
		for ksu in ksu_set:
			print ksu.description
			
			reason_status = 'NoReason'
			if ksu.reason_id:
				reason_ksu = KSU3.get_by_id(ksu.reason_id.id())
				reason_status = reason_ksu.status

			event = Event3(
				theory_id = ksu.theory_id,
				ksu_id = ksu.key,
				description = 'Critical burn for not: ' + ksu.description,
				reason_status = reason_status,
				event_date = game_log_user_date,
				event_type = 'Stupidity',
				score = critical_burn)
			
			event.put()
			self.update_game_log(event, game_log)

		return

	def create_new_game_log(self, old_game_log):
		theory = self.theory
		metirs_for_50_slack_cut = 1000
		metirs_for_100_slack_cut = 5000

		old_game_log.piggy_bank_eod = int(old_game_log.piggy_bank_sod + old_game_log.merits_earned - old_game_log.merits_goal * (1 - old_game_log.slack_cut) - old_game_log.merits_loss)
		old_game_log.ev_piggy_bank_eod = old_game_log.ev_piggy_bank_sod + old_game_log.ev_merits_earned - old_game_log.ev_merits_goal
		old_game_log.put()

		attempt = old_game_log.attempt
		
		if old_game_log.piggy_bank_eod >= 0 and old_game_log.ev_piggy_bank_eod >= 0:
			streak_day = old_game_log.streak_day + 1			
			piggy_bank_sod = old_game_log.piggy_bank_eod
			ev_piggy_bank_sod = old_game_log.ev_piggy_bank_eod
			streak_merits = old_game_log.streak_merits + old_game_log.merits_earned
			available_50_slack_cut = int(math.floor(streak_merits/metirs_for_50_slack_cut - old_game_log.used_50_slack_cut))
			available_100_slack_cut = int(math.floor(streak_merits/metirs_for_100_slack_cut - old_game_log.used_100_slack_cut))
			used_50_slack_cut = old_game_log.used_50_slack_cut
			used_100_slack_cut = old_game_log.used_100_slack_cut
		
		else:
			streak_day = 0
			piggy_bank_sod = 0
			ev_piggy_bank_sod = 0
			streak_merits = 0
			available_50_slack_cut = 0
			available_100_slack_cut = 0
			used_50_slack_cut = 0
			used_100_slack_cut = 0

			if old_game_log.streak_day > 0:
				attempt = old_game_log.attempt + 1

		game_log = GameLog(
			theory_id=theory.key,
			user_date=old_game_log.user_date + timedelta(days=1),
			piggy_bank_sod=piggy_bank_sod,
			ev_piggy_bank_sod=ev_piggy_bank_sod,
			merits_goal=self.define_merits_goal(streak_day),
			ev_merits_goal=self.define_merits_goal(streak_day, end_value=True),
			streak_day=streak_day,
			attempt=attempt,
			streak_merits=streak_merits,
			available_50_slack_cut=available_50_slack_cut,
			available_100_slack_cut=available_100_slack_cut,
			used_50_slack_cut=used_50_slack_cut,
			used_100_slack_cut=used_100_slack_cut)

		game_log.put()
		theory.game_log_key = game_log.key
		
		theory.game = self.check_for_new_best_score(theory.game, old_game_log)
		theory.put()

		return game_log

	def update_game_log(self, event, game_log, delete_event=False):

		event_type = event.event_type
		score = event.score
		if delete_event:
			score = -score

		if event_type == 'Effort':
			game_log.merits_earned += score
		
		elif event_type == 'Stupidity':
			game_log.merits_loss += score 

		if event_type == 'EndValue':
			game_log.ev_merits_earned += score

		elif event_type == 'Activate50SlackCut':
			game_log.slack_cut = 0.5
			game_log.available_50_slack_cut -= 1
			game_log.used_50_slack_cut += 1

		elif event_type == 'Activate100SlackCut':
			game_log.slack_cut = 1.0
			game_log.available_100_slack_cut -= 1
			game_log.used_100_slack_cut += 1

		game_log.available_50_slack_cut = int(math.floor((game_log.streak_merits + game_log.merits_earned)/1000 - game_log.used_50_slack_cut))
		game_log.available_100_slack_cut = int(math.floor((game_log.streak_merits + game_log.merits_earned)/5000 - game_log.used_100_slack_cut))

		game_log.put()
		return game_log

	def check_for_new_best_score(self, game, game_log):

		if game['best_merits_earned'] < game_log.merits_earned:
			game['best_merits_earned'] = game_log.merits_earned
		
		if game['best_streak_day'] < game_log.streak_day:
			game['best_streak_day'] = game_log.streak_day

		if game['best_piggy_bank_eod'] < game_log.piggy_bank_eod:
			game['best_piggy_bank_eod'] = game_log.piggy_bank_eod

		if game['best_ev_merits_earned'] < game_log.ev_merits_earned:
			game['best_ev_merits_earned'] = game_log.ev_merits_earned

		if game['best_ev_piggy_bank_eod'] < game_log.ev_piggy_bank_eod:
			game['best_ev_piggy_bank_eod'] = game_log.ev_piggy_bank_eod

		return game

	def make_template(self, template_name):
		templates = {
			'event_type_summary': {'score':{1:0, 2:0, 3:0, 4:0, 5:0, 'total':0}, 'events':{1:0, 2:0, 3:0, 4:0, 5:0, 'total':0}, 'days':[]},
			'merits_summary': {'score':{'total':0, 'average':0}, 'events':{'total':0, 'average':0}},
			'events_total': {'score':0, 'events':0, 'counter':0}
		}
		return templates[template_name]

	def define_merits_goal(self, streak_day, end_value=False):

		goal_range = [
			[142, 160, 6],
			[87, 150, 5],
			[53, 140, 5],
			[32, 130, 5],
			[19, 120, 4],
			[11, 110, 4],
			[6, 100, 4],
			[3, 90, 3],
			[1, 80, 3],
			[0, 70, 3],	
		]

		for level in goal_range:
			if streak_day >= level[0]:
				if not end_value:
					return level[1]
				else:
					return level[2]
		return

	def game_log_to_dic(self, game_log): #xx Aqui nos quedamos para comenzar a enviar vectores de informacion de esfuerzo y end value
		
		change_in_piggy_bank = game_log.merits_earned - game_log.merits_goal * (1 - game_log.slack_cut) - game_log.merits_loss

		symbol = ''
		if change_in_piggy_bank > 0:
			symbol = '+'

		change_in_ev_piggy_bank = game_log.ev_merits_earned - game_log.ev_merits_goal

		ev_symbol = ''
		if change_in_ev_piggy_bank > 0:
			ev_symbol = '+'

		piggy_bank = symbol + str((int(change_in_piggy_bank))) + ' | ' + ev_symbol + str((int(change_in_ev_piggy_bank))) 

		game_log_dic = {
			'user_date': game_log.user_date.strftime('%b %d, %Y'),

			'attempt': game_log.attempt,
			'streak_day': game_log.streak_day,
			'streak_merits': game_log.streak_merits,
			
			'piggy_bank_sod': game_log.piggy_bank_sod,
			'ev_piggy_bank_sod': game_log.piggy_bank_sod,

			'piggy_bank_eod': str(game_log.piggy_bank_eod) + '  |  ' + str(game_log.ev_piggy_bank_eod),
			'piggy_bank': piggy_bank,

			'merits_goal': str(game_log.merits_goal) + '  |  ' + str(game_log.ev_merits_goal),
			'ev_merits_goal': game_log.ev_merits_goal,
			'merits_earned': str(game_log.merits_earned) + '  |  ' + str(game_log.ev_merits_earned),
			'merits_loss': game_log.merits_loss,
			
			'slack_cut': str(int(game_log.slack_cut*100))+'%',

			'available_50_slack_cut': game_log.available_50_slack_cut,
			'available_100_slack_cut': game_log.available_100_slack_cut,

			'merits_till_next_50_slack_cut': 1000 - game_log.streak_merits - game_log.merits_earned + (game_log.used_50_slack_cut + game_log.available_50_slack_cut)*1000,
			'merits_till_next_100_slack_cut': 5000 - game_log.streak_merits - game_log.merits_earned + (game_log.used_100_slack_cut + game_log.available_100_slack_cut)*5000,  

			'disable_50_slack_cut': game_log.slack_cut > 0 or game_log.available_50_slack_cut <= 0,
			'disable_100_slack_cut': game_log.slack_cut > 0 or game_log.available_100_slack_cut <= 0,

		}

		return game_log_dic



# ---- KASware3 ----
class Home(Handler):

	@super_user_bouncer
	def get(self):
		constants['ksu_types'] = KASware3.ksu_types		
		new_pic_input_action = "{0}".format(blobstore.create_upload_url('/upload_pic'))
		self.print_html('KASware3.html', constants=constants, new_pic_input_action=new_pic_input_action)

	@super_user_bouncer
	def post(self):
		event_details = json.loads(self.request.body);
		user_action = event_details['user_action']	
		
		if user_action in ['Action_Done', 'Stupidity_Commited', 'EndValue_Experienced']:
			ksu = KSU3.get_by_id(int(event_details['ksu_id']))
			event = self.create_event(ksu, user_action, event_details)
			event.put()
			
			ksu = self.update_ksu(ksu, user_action)
			ksu.put()

			game_log = self.update_game_log(event, self.game_log)
			event_dic = self.event_to_dic(event)
			
			self.response.out.write(json.dumps({
				'mensaje': 'Evento guardado',
				'game_log': self.game_log_to_dic(game_log),
				'event_dic':event_dic,
				'in_graveyard': ksu.in_graveyard,
				}))
			return

		elif user_action in ['Milestone_Reached', 'Measurement_Recorded']:
			ksu = KSU3.get_by_id(int(event_details['ksu_id']))
			
			event = self.create_event(ksu, user_action, event_details)
			event.put()
			
			ksu = self.update_ksu(ksu, user_action)
			ksu.put()

			event_dic = self.event_to_dic(event)
			
			self.response.out.write(json.dumps({
				'mensaje': 'Evento guardado',
				'event_dic':event_dic,
				'in_graveyard': ksu.in_graveyard,
				}))
			return

		elif user_action in ['Action_Skipped', 'Action_Pushed', 'SendToMission']: 
			ksu = KSU3.get_by_id(int(event_details['ksu_id']))
			ksu = self.update_event_date(ksu, user_action)
			ksu.put()

			new_event_date = ''
			if ksu.event_date:
				new_event_date = ksu.event_date.strftime('%Y-%m-%d')

			self.response.out.write(json.dumps({
				'mensaje':'Merit Event Created',
				'ksu_id': ksu.key.id(),
				'new_event_date': new_event_date,
				'description': ksu.description,
				}))
			return	

		elif user_action == 'RetrieveTheory':
			ksu_set = KSU3.query(KSU3.theory_id == self.theory.key).filter(KSU3.in_graveyard == False).fetch()
			ksu_output = []			
			reasons_index = []
			
			for ksu in ksu_set:
				ksu_output.append(self.ksu_to_dic(ksu))
				reasons_index.append([ksu.key.id(), ksu.ksu_subtype, ksu.description])
			
			history = Event3.query(Event3.theory_id == self.theory.key).order(-Event3.event_date).fetch()
			event_output = []
			for event in history:
				event_output.append(self.event_to_dic(event))

			game_logs = GameLog.query(GameLog.theory_id == self.theory.key).order(-GameLog.user_date).fetch()
			game_logs_output = []
			for game_log in game_logs:
				game_logs_output.append(self.game_log_to_dic(game_log))
				
			self.response.out.write(json.dumps({
				'mensaje':'Esta es la teoria del usuario:',
				'ksu_set': ksu_output,
				'history': event_output,
				'best_scores': self.theory.game,
				'game_log': self.game_log_to_dic(self.game_log),
				'game_logs': game_logs_output,
				'reasons_index':reasons_index,
				'ksu_type_attributes': KASware3.ksu_type_attributes,
				'attributes_guide': KASware3.attributes_guide,
				'reasons_guide': KASware3.reasons_guide,
				}))
			return

		elif user_action == 'SaveNewKSU':
			ksu = KSU3(theory_id=self.theory.key)
			ksu_type = event_details['ksu_type']
			attributes = self.get_ksu_type_attributes(ksu_type)

			for attribute in attributes:
				self.update_ksu_attribute(ksu, attribute, event_details[attribute])
				
			ksu.put()

			ksu_dic = self.ksu_to_dic(ksu)
			ksu_dic['mensaje'] = 'KSU3 creado y guardado desde el viewer!'
			self.response.out.write(json.dumps(ksu_dic))
			return

		elif user_action == 'DeleteKSU':
			ksu = KSU3.get_by_id(int(event_details['ksu_id']))

			child_ksus = KSU3.query(KSU3.reason_id == ksu.key).fetch()
			for child in child_ksus:
				child.reason_id = None
				child.put()

			ksu_events = Event3.query(Event3.ksu_id == ksu.key).fetch()
			for event in ksu_events:
				event.key.delete()

			ksu.key.delete()
			
			self.response.out.write(json.dumps({
				'mensaje':'KSU Borrado',
				'ksu_id': ksu.key.id(),
				'description': ksu.description,
				}))
			return

		elif user_action == 'DeleteEvent':
			event = Event3.get_by_id(int(event_details['event_id']))
			game_log = self.update_game_log(event, self.game_log, delete_event=True)
			ksu = KSU3.get_by_id(event.ksu_id.id())
			render_ksu = ksu.in_graveyard
			ksu.in_graveyard = False
			ksu.put()
			event.key.delete()
			
			self.response.out.write(json.dumps({
				'mensaje':'Evento Revertido',
				'ksu': self.ksu_to_dic(ksu),
				'game_log': self.game_log_to_dic(game_log),
				'render_ksu': render_ksu,
				}))
			return

		elif user_action == 'UpdateKsuAttribute':

			ksu = KSU3.get_by_id(int(event_details['ksu_id']))
			self.update_ksu_attribute(ksu, event_details['attr_key'], event_details['attr_value'])

			event_dic = None
			if 'status' == event_details['attr_key']:
				status = event_details['attr_value']
				if status in ['Present', 'Past', 'Memory', 'Pursuit']:
					user_action = 'LifePieceTo_' + status
					event = self.create_event(ksu, user_action, {})
					event.put()	
					if user_action in ksu.details:
						Event3.get_by_id(int(ksu.details[user_action])).key.delete()
					ksu.details['LifePieceTo_' + status] = event.key.id()
					event_dic = self.event_to_dic(event)

			ksu.put()
			self.response.out.write(json.dumps({
				'mensaje':'Attributo actualizado',
				'event_dic': event_dic,
				'ksu_dic': self.ksu_to_dic(ksu)
				}))
			return
		
		elif user_action == 'UpdateTheoryAttribute':
			theory = Theory.get_by_id(int(event_details['theory_id']))
			theory = self.update_ksu_attribute(theory, event_details['attr_key'], event_details['attr_value'])[0]
			theory.put()
			self.theory = theory
			self.response.out.write(json.dumps({'mensaje':'Attributo de la teoria actualizado'}))
			return

		elif user_action == 'RequestNewPicInputAction':
			new_pic_input_action = "{0}".format(blobstore.create_upload_url('/upload_pic'))
			self.response.out.write(json.dumps({
					'new_pic_input_action': new_pic_input_action,
					'mensaje':'Nueva accion enviada',
					}))
			return
		
		elif user_action == 'RetrieveDashboard':
			
			end_date = (datetime.strptime(event_details['period_end_date'], '%Y-%m-%d')) + timedelta(minutes=1439)
			start_date = end_date - timedelta(days=int(event_details['period_duration'])-1)
				
			dashboard_base = self.CreateDashboardBase(start_date, end_date)
			dashboard_sections = self.CreateDashboardSections(dashboard_base)

			self.response.out.write(json.dumps({
					'dashboard_sections': dashboard_sections,
					'mensaje':'Dashboard values calculated',
					}))
		
		elif user_action in ['Activate50SlackCut', 'Activate100SlackCut']:
					
			game_log = self.update_game_log(Event3(event_type = user_action), self.game_log)
						
			self.response.out.write(json.dumps({
				'mensaje': 'Salck cutter succesfully activated',
				'game_log': self.game_log_to_dic(game_log),
				}))

		return

	def update_ksu(self, ksu, user_action):

		if user_action in ['Action_Done', 'EndValue_Experienced']:
			ksu = self.update_event_date(ksu, user_action)
			if ksu.details['repeats'] == 'Never' and ksu.ksu_subtype != 'Reactive':
				ksu.in_graveyard = True
		
		elif user_action == 'Milestone_Reached':
			ksu.in_graveyard = True

		elif user_action == 'EndValue_Experienced':
			if ksu.ksu_subtype in ['Moment', 'Chapter']:
				ksu.in_graveyard = True

		return ksu

	def update_ksu_attribute(self, ksu, attr_key, attr_value):

		attr_type = KASware3.attributes_guide[attr_key][0]
		fixed_key = attr_key
		fixed_value = attr_value
		event = None

		if attr_type in ['String', 'Text']:
			fixed_value = attr_value.encode('utf-8')
		
		elif attr_type == 'Integer':
			if attr_value != '':
				fixed_value = int(attr_value)
			else:
				fixed_value = 0
					
		elif attr_type == 'Details':
			fixed_key = 'details'
			details_dic = ksu.details
			details_dic[attr_key] = fixed_value
			fixed_value = details_dic
		
		elif attr_type == 'Key':
			fixed_value = None
			if attr_value != '':
				fixed_value = KSU3.get_by_id(int(attr_value)).key

		elif attr_type == 'DateTime':
			fixed_value = None
			if attr_value != '':
				fixed_value = datetime.strptime(attr_value, '%Y-%m-%d')		
	
		elif attr_type == 'BlobKey':
			fixed_value = None
			#Queda pendiente decirle que hacer con el blobkey

		setattr(ksu, fixed_key, fixed_value)
		return ksu, event
	
	def ksu_to_dic(self, ksu):
		ksu_dic = {
			'ksu_id': ksu.key.id(),
			'event_date': '',
			'reason_id': '',
		}
		
		ksu_attributes = self.get_ksu_type_attributes(ksu.ksu_type)
		details_dic = ksu.details

		for attribute in ksu_attributes:
			attr_type = KASware3.attributes_guide[attribute][0]

			if attr_type in  ['String', 'Text', 'Integer', 'Boolean']:
				ksu_dic[attribute] = getattr(ksu, attribute)
			
			elif attr_type == 'Details':
				if attribute in details_dic:
					ksu_dic[attribute] = details_dic[attribute]

		if ksu.event_date:
			ksu_dic['event_date'] = ksu.event_date.strftime('%Y-%m-%d'),
		
		if ksu.reason_id:
			ksu_dic['reason_id'] = ksu.reason_id.id()
						
		return ksu_dic

	def event_to_dic(self, event):
		event_dic = {
			'event_id': event.key.id(),
			'event_type': event.event_type,
			'score':event.score,
			'description': event.description,
			'event_date': event.event_date.strftime('%I:%M %p. %a, %b %d, %Y'),
			'counter': event.counter,
			'events':1
		}
		return event_dic

	def get_ksu_type_attributes(self, ksu_type):
		attributes = KASware3.ksu_type_attributes['Base'] + KASware3.ksu_type_attributes[ksu_type] 
		
		if ksu_type in ['Experience', 'Contribution', 'SelfAttribute', 'Person', 'Possesion', 'Environment']:
			attributes += KASware3.ksu_type_attributes['LifePiece']
		return attributes

	def update_event_date(self, ksu, user_action):
		today = (datetime.today()+timedelta(hours=self.theory.timezone)+timedelta(days=time_travel)).replace(microsecond=0,second=0,minute=0,hour=0)
		# today = datetime(2017,12,5)
		tomorrow = today + timedelta(days=1)
		ksu_details = ksu.details

		if user_action in ['Action_Done', 'Action_Skipped']:
			repeats = ksu_details['repeats']
			
			if repeats == 'Never':
				ksu.event_date = None
			
			elif repeats == 'Always':
				ksu.event_date = today

			elif repeats == 'X_Days':
				x_days = int(ksu.details['every_x_days'])
				ksu.event_date = today + timedelta(days=x_days)
				
			elif repeats == 'Week':
				todays_weekday = today.weekday()
				
				week = ['every_mon','every_tue','every_wed','every_thu','every_fri','every_sat', 'every_sun']
				week = week[todays_weekday:] + week[0:todays_weekday]
				week = week[1:7]

				x_days = 1
				for day in week:
					if ksu_details[day]:
						break
					else:
						x_days += 1				
				ksu.event_date = today + timedelta(days=x_days)

			elif repeats in ['Month', 'Year']:
				next_year = today.year
				
				if repeats == 'Month':					
					next_month = today.month + 1
					if next_month == 13:
						next_month = 1
						next_year += 1
				
				elif repeats == 'Year':
					next_month = int(ksu_details['of_month'])
					next_year += 1
				
				max_day = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
				next_day = min(int(ksu_details['on_the_day']), max_day[next_month - 1])
					
				ksu.event_date = datetime(next_year, next_month, next_day) 
				
		if user_action == 'Action_Pushed':
			ksu.event_date = tomorrow

		if user_action == 'SendToMission':
			ksu.event_date = today

		return ksu

	def create_event(self, ksu, user_action, event_details):
		weight = {1:1, 2:3, 3:5, 4:8, 5:13} #Peso para ponderar Life Pieces según su importancia/size
		ksu_subtype = ksu.ksu_subtype
		description = ksu.description

		if user_action == 'Action_Done':
			event_type = 'Effort'
		
		elif user_action == 'Stupidity_Commited':
			event_type = 'Stupidity'
			description = ksu.details['negative_alternative']

		elif user_action == 'Milestone_Reached':
			event_type = 'Progress'

		elif user_action == 'EndValue_Experienced':
			event_type = 'EndValue'

		elif user_action in ['LifePieceTo_Present','LifePieceTo_Memory']:
			event_type = 'WishRealized'

		elif user_action in ['LifePieceTo_Pursuit']:
			event_type = 'PursuitStarted'

		elif user_action == 'LifePieceTo_Past':
			event_type = 'LifePieceGone'

		elif user_action == 'Measurement_Recorded':
			description = ksu.details['question']
			if ksu_subtype == 'Perception':
				event_type = 'PerceptionSnapshot'
			elif ksu_subtype == 'Reality':
				event_type = 'RealitySnapshot'

		event_date = (datetime.today() + timedelta(hours=self.theory.timezone) + timedelta(days=time_travel))
		if ksu.event_date and ksu_subtype not in ['Action', 'Objective']:
			event_date = ksu.event_date

		size = ksu.size
		if 'size' in event_details:
			size = int(event_details['size'])	

		score = 0
		if 'score' in event_details:
			score = int(event_details['score'])
			
		elif event_type in ['WishRealized', 'LifePieceGone']:
			score = weight[size]

		elif event_type == 'Progress':
			score = 1

		counter = 1
		if 'counter' in event_details:
			counter = int(event_details['counter'])
		
		reps = 1
		if 'reps' in event_details:
			reps = int(event_details['reps'])


		reason_status = 'NoReason'
		if ksu.reason_id:
			reason_ksu = KSU3.get_by_id(ksu.reason_id.id())
			reason_status = reason_ksu.status

		event = Event3(
			theory_id = ksu.theory_id,
			ksu_id = ksu.key,
			description = description,
			reason_status = reason_status,
			event_date = event_date, 

			event_type = event_type,
			score = score,
			counter = counter,

			size = size)

		return event

	def CreateDashboardBase(self, start_date, end_date):

		dashboard_base = {'current':{}, 'previous':{}}
			
		for time_frame in ['current', 'previous']:
			
			for ksu_type in KASware3.ksu_types:
				dashboard_base[time_frame][ksu_type[0][0]] = {}

				for event_type in KASware3.event_types:
					
					dashboard_base[time_frame][ksu_type[0][0]][event_type] = self.make_template('events_total')

			for event_type in KASware3.event_types:

				dashboard_base[time_frame][event_type] = self.make_template('events_total')

		period_len = end_date.toordinal() - start_date.toordinal() + 1
		previous_start_date = start_date - timedelta(days=period_len)
		history = Event3.query(Event3.theory_id == self.theory.key).filter(Event3.event_date >= previous_start_date, Event3.event_date <= end_date).order(-Event3.event_date).fetch()
	
		ksu_set = KSU3.query(KSU3.theory_id == self.theory.key).fetch()
		
		monitored_ksus = []
		monitored_ksus_ids = []
		monitored_ksus_dic = {}
		superficial_scores = {}
		
		for ksu in ksu_set:
			ksu_id = ksu.key.id()
			if ksu.ksu_type != 'Indicator':
				ksu_event_types = ['Effort', 'Stupidity']
			
			else:
				ksu_event_types = ['PerceptionSnapshot', 'RealitySnapshot']

			superficial_scores[ksu_id] = {'ksu_type': ksu.ksu_type}
			for ksu_event_type in ksu_event_types:				
				superficial_scores[ksu_id][ksu_event_type] = { 'current': self.make_template('events_total'), 'previous': self.make_template('events_total')}
			
			if ksu.monitor and not ksu.in_graveyard:
				monitored_ksus_ids.append(ksu_id)
				monitored_ksus_dic[ksu_id] = ksu	

		for event in history:

			event_type = event.event_type
			time_frame = 'current'
			event_date = event.event_date
			
			if event.event_date < start_date:
				time_frame = 'previous'

			ksu_id = event.ksu_id.id()
			ksu_type_summary = dashboard_base[time_frame][superficial_scores[ksu_id]['ksu_type']][event_type]
			event_type_summmary = dashboard_base[time_frame][event_type]
			if event_type in superficial_scores[ksu_id]:
				ksu_score_summary = superficial_scores[ksu_id][event_type][time_frame]

			event_dic = self.event_to_dic(event)

			for score_type in ['score', 'events', 'counter']:		
				ksu_type_summary[score_type] += event_dic[score_type]
				event_type_summmary[score_type] += event_dic[score_type]
				if event_type in superficial_scores[ksu_id]:
					ksu_score_summary[score_type] += event_dic[score_type]	

		for time_frame in ['current', 'previous']:			
			for event_type in KASware3.event_types:
				dashboard_base[time_frame][event_type] = self.add_average_to_events_total(dashboard_base[time_frame][event_type], period_len)

		deep_scores = self.calculate_deep_scores(ksu_set, superficial_scores, 4)

		monitored_ksus_sections = []
		for ksu_id in monitored_ksus_ids:
			ksu = monitored_ksus_dic[ksu_id]
			section = self.ksu_to_dashboard_section(ksu, deep_scores[ksu_id], period_len)
			monitored_ksus_sections.append(section)
			
			if ksu.ksu_subtype == 'Reactive':
				
				ksu.ksu_subtype = 'Negative'
				ksu.description = ksu.details['negative_alternative']
				section = self.ksu_to_dashboard_section(ksu, deep_scores[ksu_id], period_len)
				monitored_ksus_sections.append(section)

		dashboard_base['monitored_ksus_sections'] = monitored_ksus_sections

		return dashboard_base	

	def CreateDashboardSections(self, dashboard_base):

		game = self.theory.game
		
		dashboard_sections = [
			{'section_type':'Overall',
			'section_subtype':'Overall',
			'sub_sections':[
				
				{'title': 'Joy Clusters', #Formerly Merits Reserves #xx
				'score': '0',
				'contrast_title': 'End value in current cluster',
				'contrast': '0 of 1,000'},


				{'title': 'Endeavours',				
				'score': 'X', #game['endevours'],
				'contrast_title': 'Merits in current endevour:',
				'contrast': '0 of 10,000'},

				{'title': 'Discipline Lvl.',
				'score': 'X',
				'contrast_title': 'Days in current level:',
				'contrast': '00 of 00'},
			]},


			{'section_type':'ActionsSummary',
			'section_subtype':'Summary',
			'title': 'End Value Generated',
			'sub_sections':[
				{'title': 'Total',
				'score':'00',
				'contrast':'00'},

				{'title': 'Average',
				'score': dashboard_base['current']['WishRealized']['averages']['score'],
				'contrast': dashboard_base['previous']['WishRealized']['averages']['score']},
			]},

			{'section_type':'ActionsSummary',
			'section_subtype':'Summary',
			'title': 'Effort Made',
			'sub_sections':[
				{'title': 'Total',
				'operator': 'total',
				'score': dashboard_base['current']['Effort']['score'],
				'contrast':dashboard_base['previous']['Effort']['score']},

				{'title': 'Average',
				'operator': 'average',
				'score': dashboard_base['current']['Effort']['averages']['score'],
				'contrast':dashboard_base['previous']['Effort']['averages']['score']},
			]},

			{'section_type':'ActionsSummary',
			'section_subtype':'Summary',
			'title': 'Stupidity Commited',
			'sub_sections':[
				{'title': 'Total',
				'operator': 'total',
				'score': dashboard_base['current']['Stupidity']['score'],
				'contrast':dashboard_base['previous']['Stupidity']['score']},

				{'title': 'Average',
				'operator': 'average',
				'score': dashboard_base['current']['Stupidity']['averages']['score'],
				'contrast': dashboard_base['previous']['Stupidity']['averages']['score']},
			]},

			{'section_type':'ActionsSummary',
			'section_subtype':'Summary',
			'title': 'Milestones Reached',
			'sub_sections':[
				{'title': 'Total',
				'score': dashboard_base['current']['Progress']['score'],
				'contrast':dashboard_base['previous']['Progress']['score']},

				{'title': 'Average',
				'score': dashboard_base['current']['Progress']['averages']['score'],
				'contrast': dashboard_base['previous']['Progress']['averages']['score']},
			]},
		]


		section_titles = {
			'Progress': 'Milestones Reached',
			'WishRealized': 'Wishes Realized'
		}
		

		for event_type in ['WishRealized']:
			section = {
				'section_type':'LifePiecesSummary',
				'section_subtype':'Summary',
				'title': section_titles[event_type],
				'sub_sections':[]
			}

			for ksu_type in KASware3.life_pieces:
				section['sub_sections'].append({
					'glyphicon': ksu_type[1],
					'score': dashboard_base['current'][ksu_type[0]][event_type]['score'],
					'contrast': dashboard_base['previous'][ksu_type[0]][event_type]['score']
				})

			dashboard_sections.append(section)

		return dashboard_sections + dashboard_base['monitored_ksus_sections']

	def add_average_to_events_total(self, events_total, period_len):
		events_total['averages'] = {}
		for section in ['score', 'events', 'counter']:
			events_total['averages'][section] = round(events_total[section]/(period_len*1.0),1)

		return events_total

	def ksu_to_dashboard_section(self, ksu, ksu_deep_score, period_len):
		
		event_type = 'Effort'		
		
		goal_factor = (period_len * 1.0 /int(ksu.details['goal_time_frame']))
		for goal in ['goal_score', 'goal_counter', 'goal_events']:
			if ksu.details[goal] == '':
				ksu.details[goal] = 0
			elif ksu.ksu_type != 'Indicator':
				ksu.details[goal] = round(int(ksu.details[goal]) * goal_factor, 1)
			else:
				ksu.details[goal] = float(ksu.details[goal])

		ksu_subtype = ksu.ksu_subtype
		sub_sections_titles = {'score':'Merits Earned', 'events':'Total Actions', 'counter':'Total Minutes'}
		
		if ksu_subtype == 'Reactive':
			sub_sections_titles['counter'] = 'Total Repetitions'
		
		elif ksu_subtype == 'Negative':
			event_type = 'Stupidity'
			sub_sections_titles['counter'] = 'Total Repetitions'
			sub_sections_titles['score'] = 'Merits Loss'

		print
		print ksu_deep_score
		print

		section = {
			'section_type':'KsuSummary',	
			'title':ksu.description,
			'ksu_type': ksu.ksu_type,
			'section_subtype': 'MonitoredKSU',			
			'sub_sections':[]}


		if ksu.ksu_subtype in ['Reactive', 'Negative']:
			section['sub_sections'] = [
				{'title':sub_sections_titles['score'],
				'score':ksu_deep_score[event_type]['current']['score'],				
				'contrast_title': 'PP: ',
				'contrast':ksu_deep_score[event_type]['previous']['score']},

				{'title': sub_sections_titles['counter'],
				'score':ksu_deep_score[event_type]['current']['counter'],
				'contrast_title': 'PP: ',
				'contrast':ksu_deep_score[event_type]['previous']['counter']},

				{'title':sub_sections_titles['events'],
				'score':ksu_deep_score[event_type]['current']['events'],
				'contrast_title': 'PP: ',
				'contrast':ksu_deep_score[event_type]['previous']['counter']}
			]


		elif ksu.ksu_type != 'Indicator':
			section['sub_sections'] = [
				{'title':sub_sections_titles['score'],
				'score':ksu_deep_score[event_type]['current']['score'],				
				'contrast_title': 'Goal',
				'contrast':ksu.details['goal_score']},

				{'title': sub_sections_titles['counter'],
				'score':ksu_deep_score[event_type]['current']['counter'],
				'contrast_title': 'Goal',
				'contrast':ksu.details['goal_counter']},

				{'title':sub_sections_titles['events'],
				'score':ksu_deep_score[event_type]['current']['events'],
				'contrast_title': 'Goal',
				'contrast':ksu.details['goal_events']}
			]

		elif ksu_subtype == 'Reality':
			sub_sections_titles['events'] = 'Data Points'
			event_type = 'RealitySnapshot'
			section['sub_sections'] = [				
				{'title':'Period Average',
				'score':1.0*ksu_deep_score[event_type]['current']['score']/ksu_deep_score[event_type]['current']['events'],				
				'contrast_title': 'Goal',
				'contrast':ksu.details['goal_score']},

				{'title':sub_sections_titles['events'],
				'score':ksu_deep_score[event_type]['current']['events'],
				'contrast_title': 'Goal',
				'contrast':ksu.details['goal_events']}
			]

		elif ksu_subtype == 'Perception':
			sub_sections_titles['events'] = 'Data Points'
			event_type = 'PerceptionSnapshot'
			section['sub_sections'] = [				
				{'title':'Period Average',
				'score':str(int(100.0*ksu_deep_score[event_type]['current']['score']/ksu_deep_score[event_type]['current']['events']))+'%',				
				'contrast_title': 'Goal',
				'contrast':ksu.details['goal_score']},

				{'title':sub_sections_titles['events'],
				'score':ksu_deep_score[event_type]['current']['events'],
				'contrast_title': 'Goal',
				'contrast':ksu.details['goal_events']}
			]

		return section		

	def calculate_deep_scores(self, ksu_set, superficial_scores, generations):

		parent_ksus = []
		parent_childs = {}
		deep_scores = superficial_scores.copy()

		for ksu in ksu_set:
			
			ksu_id = ksu.key.id()
			reason_id = ksu.reason_id
			
			if reason_id:
				reason_id = reason_id.id()
				if reason_id not in parent_ksus:
					parent_ksus.append(reason_id)
					parent_childs[reason_id] = [ksu_id]
				
				elif ksu_id not in parent_childs[reason_id]:
					parent_childs[reason_id].append(ksu_id)

		for i in range(generations):
			for ksu in parent_ksus:
				new_childs = [] + parent_childs[ksu]
				for child in parent_childs[ksu]:
					if child in parent_childs:
						for grand_child in parent_childs[child]: 
							if grand_child not in new_childs:
								new_childs.append(grand_child)
				parent_childs[ksu] = new_childs

		
		for time_frame in ['current', 'previous']:
			
			for ksu in parent_ksus:
				parent_deep_score = deep_scores[ksu]
				score_types = ['score', 'events', 'counter']

				for child in parent_childs[ksu]:
					child_superficial_score = superficial_scores[child]
					for event_type in ['Effort', 'Stupidity']:

						if event_type in parent_deep_score and event_type in child_superficial_score:

							for score_type in score_types:
								parent_deep_score[event_type][time_frame][score_type] += child_superficial_score[event_type][time_frame][score_type]

		return deep_scores


class SignUpLogIn(Handler):
	def get(self):
		self.print_html('SignUpLogIn.html', login_error = False)

	def post(self):
 
		post_details = json.loads(self.request.body)
		user_action = post_details['user_action']
		next_step = 'No next step defined'

		print
		print 'Asi se ve el AJAX Request'
		print post_details
		
		if user_action == 'Random_SignUp':
			post_details.update(randomUser.createRandomUser()) ## Creates a random user for testing Contributions
		
		if user_action == 'SignUp' or user_action == 'Random_SignUp':
			input_error = user_input_error(post_details)
			theory = Theory.get_by_email(post_details['email'])	
			
			if input_error:
				next_step = 'TryAgain'
											
			elif theory:
				next_step = 'TryAgain'
				input_error = 'That email is already register to another user!'
				

			else:
				next_step = 'CheckYourEmail'
				password_hash = make_password_hash(post_details['email'], post_details['password'])
				
				theory = Theory(
					email=post_details['email'], 
					password_hash=password_hash, 
					first_name=post_details['first_name'], 
					last_name=post_details['last_name'],
					timezone=-6,
					categories={'tags':[]})

				theory.put()

				game_log = GameLog(
					theory_id=theory.key,
					user_date=(datetime.today() + timedelta(hours=theory.timezone) +timedelta(days=time_travel)).replace(microsecond=0,second=0,minute=0,hour=0),
					merits_goal=self.define_merits_goal(0),
					ev_merits_goal=self.define_merits_goal(0, end_value=True),
					attempt=1,
					)

				game_log.put()

				theory.game_log_key = game_log.key
				theory.put()

				#Loads OS Ksus
				# for post_details in os_ksus:
				# 	ksu = KSU(theory=theory.key)
				# 	ksu = prepareInputForSaving(theory, ksu, post_details)
				# 	ksu.put()
				
				# self.login(theory)				
				email_receiver = str(theory.email)
				# email_receiver = 'amigabledave@gmail.com'
				email_body = '<a href="kasware.com/Accounts?user_id='+str(theory.key.id())+'&user_request=validate_email">Confirm my account</a>' + ", I'm ready to start using KASware!"    			
				mail.send_mail(sender="KASware@kasware2000.appspotmail.com", to=email_receiver, subject="Please confirm your email address to start using KASware", body=email_body, html=email_body) #"<accounts@kasware.com>"
				print
				print email_body
				# self.redirect('/Accounts?user_request=create_account')
				# return
				# self.redirect('/MissionViewer?time_frame=Today')

			self.response.out.write(json.dumps({
				'next_step':next_step,
				'input_error':input_error
				}))
			return

		if user_action == 'LogIn':
			next_step = 'No next step defined'			
			email = post_details['email']
			password = post_details['password']
			theory = Theory.valid_login(email, password)
			if theory:
				self.login(theory)
				next_step = 'GoToYourTheory'
			else:
				next_step = 'TryAgain'
			
			self.response.out.write(json.dumps({
				'next_step':next_step,
				}))
			return


class Accounts(Handler):
	def get(self):
		
		theory_id = self.request.get('user_id')
		reset_code = self.request.get('reset_code')
		user_request = self.request.get('user_request')


		if theory_id:
			theory = Theory.get_by_theory_id(int(theory_id))
			
			if user_request == 'validate_email':
				if theory and not theory.valid_email:
					theory.valid_email = True
					theory.put()
					self.login(theory)
					self.redirect('/MissionViewer?time_frame=Today')
				else:
					self.redirect('/SignUpLogIn')

			else:
				self.print_html('Accounts.html', user_request=user_request, theory_id=theory_id, password_hash=reset_code)

		else:
			self.print_html('Accounts.html', user_request=user_request, theory_id=theory_id, password_hash=reset_code)


	def post(self):
		event_details = json.loads(self.request.body)
		user_action = event_details['user_action']
		next_step = 'No next step defined'

		if user_action == 'LogIn':					
			email = event_details['email']
			password = event_details['password']
			theory = Theory.valid_login(email, password)
			if theory:
				self.login(theory)
				next_step = 'GoToYourTheory'
			else:
				next_step = 'TryAgain'
			
			self.response.out.write(json.dumps({
				'next_step':next_step,
				}))
			return


		if user_action == 'RequestPasswordReset':
			theory = Theory.get_by_email(event_details['user_email'])	
			if theory:
				next_step = 'CheckYourEmail'

				email_receiver = str(theory.email)
				email_body = '<a href="kasware.com/Accounts?user_id='+str(theory.key.id())+'&user_request=set_new_password&reset_code='+str(theory.password_hash)+'">Reset my password</a>'
				mail.send_mail(sender="KASware@kasware2000.appspotmail.com", to=email_receiver, subject="KASware password reset", body=email_body, html=email_body) #"<accounts@kasware.com>"
				print
				print email_body

			else:
				next_step = 'EnterValidEmail'

			self.response.out.write(json.dumps({
				'next_step':next_step,
				}))
			return


		if user_action == 'SetNewPassword':
		
			theory_id = event_details['theory_id']
			reset_code = event_details['password_hash']
			print
			print 'Theory id:' + theory_id
			print 'Password hash: ' + reset_code

			theory = Theory.get_by_theory_id(int(theory_id))
			
			if reset_code == theory.password_hash:
				theory.password_hash = make_password_hash(theory.email, event_details['new_password'])
				theory.put()
				self.login(theory)
				next_step = 'GoToYourTheory'
			
			else:
				next_step = 'EnterValidPassword'

			self.response.out.write(json.dumps({
				'next_step':next_step,
				}))
			return


class LogOut(Handler):
	def get(self):
		self.logout()
		self.redirect('/')


class Settings(Handler):

	@super_user_bouncer
	def get(self):
		theory = self.theory
		today = datetime.today()+timedelta(days=time_travel)

		local_today = datetime.today()+timedelta(hours=theory.timezone)+timedelta(days=time_travel)

		user_today = local_today

		active_date = user_today.toordinal()
		
		tags = sorted(self.theory.categories['tags'])

		self.print_html('Settings.html', today=today, local_today=local_today, user_today=user_today, constants=constants, tags=tags)


	@super_user_bouncer
	def post(self, user_action, post_details):
		logging.info('These are the post details: ') #Asi es como se imprime algo en la consola de windows
		logging.info(post_details)

		if user_action == 'SaveChanges':
			theory = self.theory
			game = self.game

			theory.first_name = post_details['first_name'].encode('utf-8') 
			theory.last_name = post_details['last_name'].encode('utf-8')	
	 	
	 		theory.language = str(post_details['language'])
	 		
	 		if 'hide_private_ksus' in post_details:
	 			theory.hide_private_ksus = True
			else:
				theory.hide_private_ksus = False

		 	theory.timezone = int(post_details['timezone'])
 			
			game['mission_burn'] = int(post_details['mission_burn'])
			game['critical_burn'] = int(post_details['critical_burn'])
			game['daily_goal'] = int(post_details['minimum_daily_effort'])
 			game['piggy_bank'] = int(post_details['piggy_bank'])
 			game['streak'] = int(post_details['streak'])
 			
 			theory.game = game
	 		theory.put()

 		self.redirect('/MissionViewer?time_frame=Today')

	
class PicuteUploadHandler(blobstore_handlers.BlobstoreUploadHandler):
	# @super_civilian_bouncer
	def post(self):		
		
		ksu_id = self.request.get('ksu_id')
		
		# logging.info('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
		# logging.info('Event details')
		# logging.info(event_details)
		# logging.info('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')	

		ksu = KSU3.get_by_id(int(ksu_id))
		upload = self.get_uploads()[0]
		
		ksu.pic_key = upload.key();
		ksu.pic_url = images.get_serving_url(blob_key=upload.key())
		ksu.put()

		self.response.out.write(json.dumps({
				'message':'imagen guardada!!!'
			}))	
		


#--- Development handlers ----------
class PopulateRandomTheory(Handler):
	
	def get(self):
		self.populateRandomTheory()
		self.redirect('/')

	def populateRandomTheory(self):

		post_details = {'user_action':'Random_SignUp'}
		user_action = 'Random_SignUp'

		if user_action == 'Random_SignUp':
			post_details.update(randomUser.createRandomUser()) ## Creates a random user for testing Contributions
		
		if user_action == 'SignUp' or user_action == 'Random_SignUp':
			input_error = user_input_error(post_details)
			theory = Theory.get_by_email(post_details['email'])	
			
			if input_error:
				self.print_html('SignUpLogIn.html', post_details=post_details, input_error=input_error)
			
			elif theory:
				self.print_html('SignUpLogIn.html', post_details=post_details, input_error = 'That email is already register to another user!')

			else:
				password_hash = make_password_hash(post_details['email'], post_details['password'])
				

				theory = Theory(
					email=post_details['email'], 
					password_hash=password_hash, 
					first_name=post_details['first_name'], 
					last_name=post_details['last_name'],
					timezone=-6,
					categories={'tags':[]})

				theory.put()

				game_log = GameLog(
					theory_id=theory.key,
					user_date=(datetime.today() + timedelta(hours=theory.timezone) + timedelta(days=time_travel)).replace(microsecond=0,second=0,minute=0,hour=0),
					merits_goal=self.define_merits_goal(0),
					ev_merits_goal=self.define_merits_goal(0, end_value=True),
					attempt=1,
					)

				game_log.put()

				theory.game_log_key = game_log.key
				theory.put()

				#Loads OS Ksus 
				# for post_details in os_ksus:
				# 	ksu = KSU(theory=theory.key)
				# 	ksu = prepareInputForSaving(theory, ksu, post_details)
				# 	ksu.put()

				self.login(theory)
				# self.redirect('/MissionViewer?time_frame=Today')


		theory_key = theory.key
		username = theory.first_name + ' ' + theory.last_name

		today =(datetime.today()+timedelta(hours=theory.timezone)+timedelta(days=time_travel))
		print
		print 'Este es el today de PopulateTheory:'
		print today

		theory_parameters = [
			[0, {'ksu_type':'BigO', 'ksu_subtype':'BigO'}],
			[0, {'ksu_type':'Wish', 'ksu_subtype':'Wish'}],
			[0, {'ksu_type':'EVPo', 'ksu_subtype':'EVPo', 'next_event':today, 'kpts_value':1, 'frequency':7}],
			[0, {'ksu_type':'ImPe', 'ksu_subtype':'ImPe', 'next_event':today, 'kpts_value':0.25, 'frequency':30}],
			[0, {'ksu_type':'Idea', 'ksu_subtype':'Idea'}],
			[0, {'ksu_type':'RTBG', 'ksu_subtype':'RTBG'}],
			[0, {'ksu_type':'Diary', 'ksu_subtype':'Diary', 'next_event':today, 'pretty_next_event':today.strftime('%a, %b %d, %Y'), 'frequency':1}],
			[0, {'ksu_type':'ImIn', 'ksu_subtype':'RealitySnapshot', 'next_event':today, 'pretty_next_event':today.strftime('%a, %b %d, %Y'), 'frequency':1}],
			[0, {'ksu_type':'ImIn', 'ksu_subtype':'BinaryPerception', 'next_event':today, 'pretty_next_event':today.strftime('%a, %b %d, %Y'), 'frequency':1}],
			[0, {'ksu_type':'ImIn', 'ksu_subtype':'TernaryPerception', 'next_event':today, 'pretty_next_event':today.strftime('%a, %b %d, %Y'), 'frequency':1}],			
			[0, {'ksu_type':'ImIn', 'ksu_subtype':'FibonacciPerception', 'next_event':today, 'pretty_next_event':today.strftime('%a, %b %d, %Y'), 'frequency':1}],			
			[0, {'ksu_type':'KeyA', 'ksu_subtype':'KAS3'}],
			[0, {'ksu_type':'KeyA', 'ksu_subtype':'KAS4'}],
			[0, {'ksu_type':'KeyA', 'ksu_subtype':'KAS1', 'next_event':today, 'pretty_next_event':today.strftime('%a, %b %d, %Y'), 'kpts_value':2, 'frequency':1, 'repeats':'R001'}],
			[0, {'ksu_type':'OTOA', 'ksu_subtype':'KAS2', 'next_event':today, 'pretty_next_event':today.strftime('%a, %b %d, %Y'), 'kpts_value':3}],

		]

		for e in theory_parameters:
			set_size = e[0]
			set_details = e[1]

			ksu_subtype = constants['d_KsuSubtypes'][set_details['ksu_subtype']]

			for i in range(1, set_size + 1):

				description =  str(ksu_subtype + ' no. ' + str(i) + ' of ' + username).encode('utf-8')
				secondary_description = str('Secondary description of ' + ksu_subtype + ' no. ' + str(i)).encode('utf-8')
				new_ksu = KSU(
					theory=theory_key,
					description=description,
					secondary_description=secondary_description)

				for a_key in set_details:
					a_val = set_details[a_key]
					setattr(new_ksu, a_key, a_val)
			
				
				next_event = new_ksu.next_event
				ksu_subtype = new_ksu.ksu_subtype

				if ksu_subtype in ['KAS1','KAS3','KAS4','ImPe'] and not next_event:
					new_ksu.next_event = today

				new_ksu.importance = (theory.size + 1) * 10000 
				theory.size += 1
				theory.put() 	

				new_ksu.put()		
		return


class UpdateTheoryStructure(Handler):
	
	@super_user_bouncer
	def get(self):
		user_key = self.theory.key
		ksu_set = KSU.query(KSU.theory == user_key ).filter(KSU.in_graveyard == False).order(-KSU.importance).fetch()	
		
		self.recalibrate_theory_importance(ksu_set, self.theory.size)
		self.redirect('/MissionViewer?time_frame=Today')


	def recalibrate_theory_importance(self, ordered_ksu_set, theory_size):		
		theory = self.theory
		theory_size = 0
		next_importance = 10000 
		for ksu in ordered_ksu_set:
			ksu.importance = next_importance
			next_importance += 10000
			ksu.put()
			theory_size += 1
		theory.size = theory_size
		theory.put()


class PopulateRandomHistory(Handler):
	
	@super_user_bouncer
	def get(self):
		
		valid_subtypes = ['Proactive', 'Rective', 'Negative']
		n = 2

		ksu_set = KSU3.query(KSU3.theory_id == self.theory.key).fetch()
		for ksu in ksu_set:
			if ksu.ksu_subtype in valid_subtypes:
				for i in range(0, n):
					self.create_random_event(ksu)

		self.redirect('/')

	def create_random_event(self, ksu):
		event_date = datetime.today() - timedelta(days=random.randrange(0,13) + timedelta(days=time_travel))
		ksu_event_by_subtype = {
			'Proactive':'Effort',
			'Reactive': 'Effort',
			'Negative':'Stupidity'
		}

		event = Event3(
			theory_id = ksu.theory_id,
			ksu_id = ksu.key,
			description = ksu.description,
			event_date = event_date, 

			event_type = ksu_event_by_subtype[ksu.ksu_subtype],
			score = random.randrange(0, 40),
			counter = random.randrange(0, 120),
			size = random.randrange(1, 5),
			comments = '')
		event.put()



#--- Validation and security functions ----------
secret = 'elzecreto'

def make_secure_val(val):
    return '%s|%s' % (val, hashlib.sha256(secret + val).hexdigest())

def check_secure_val(secure_val):
	val = secure_val.split('|')[0]
	if secure_val == make_secure_val(val):
		return val

def make_salt(lenght = 5):
    return ''.join(random.choice(string.letters) for x in range(lenght))

def make_password_hash(email, password, salt = None):
	if not salt:
		salt = make_salt()
	h = hashlib.sha256(email + password + salt).hexdigest()
	return '%s|%s' % (h, salt)

def validate_password(email, password, h):
	salt = h.split('|')[1]
	return h == make_password_hash(email, password, salt)

def user_input_error(post_details):
	for (attribute, value) in post_details.items():
		user_error = input_error(attribute, value)
		if user_error:
			return user_error

	if 'confirm_email' in post_details:
		if post_details['email'] != post_details['confirm_email']:
			return "Emails don't match"

	return None

def input_error(target_attribute, user_input):
	
	validation_attributes = ['first_name',
							 'last_name', 
							 'password',
							 'email']


	if target_attribute not in validation_attributes:
		return None
	
	error_key = target_attribute + '_error' 
		
	if d_RE[target_attribute].match(user_input):
		return None

	else:
		return d_RE[error_key]

d_RE = {'first_name': re.compile(r"^[a-zA-Z0-9_-]{3,20}$"),
		'first_name_error': 'Invalid first name. Your first name most be at least 3 charachers long and cannot contain any special characters.',
		
		'last_name': re.compile(r"^[a-zA-Z0-9_-]{3,20}$"),
		'last_name_error': 'Invalid last name. Your first name most be at least 3 charachers long and cannot contain any special characters.',

		'password': re.compile(r"^.{8,20}$"),
		'password_error': 'Invalid password. Your password most be at least 8 characters long.',
		
		'email': re.compile(r'^[\S]+@[\S]+\.[\S]+$'),
		'email_error': 'Invalid email syntax.'}


#--- Theory Structure Updates
class UpdateTheories(Handler):
	def get(self):
		theories = Theory.query().fetch()
		self.update_all_theories(theories)
		self.redirect('/Settings')
		return

	def update_all_theories(self, theories):
		for theory in theories:
			theory['something'] = 0
		return		


#--- Request index
app = webapp2.WSGIApplication([
	('/', Home),
	('/KASware3', Home),
	('/upload_pic', PicuteUploadHandler),

	('/SignUpLogIn', SignUpLogIn),
	('/Accounts', Accounts),
	('/LogOut', LogOut),
	('/Settings', Settings),

	('/PopulateRandomTheory',PopulateRandomTheory),
	('/PopulateRandomHistory', PopulateRandomHistory),
	('/UpdateTheoryStructure', UpdateTheoryStructure),
	# ('/UpdateTheories', UpdateTheories)
], debug=True)

