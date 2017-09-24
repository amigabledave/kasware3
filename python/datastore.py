from google.appengine.ext import ndb


class Theory(ndb.Model):

	email = ndb.StringProperty(required=True)
	nickname = ndb.StringProperty(required=True)
	password_hash = ndb.StringProperty(required=True)
	
 	settings = ndb.JsonProperty(default={
 		'language':'English',
 		'timezone': -6,
 		'hide_private_ksus': False,
 		})
  	
	game = ndb.JsonProperty(default={	
		'life_focus':'Effort',
		'best_merits_earned':0,
		'best_ev_merits_earned':0,
		'best_streak_day':0,
		'best_piggy_bank_eod':0,
		'best_ev_piggy_bank_eod':0,
		}) 
	
	game_log_key = ndb.KeyProperty()

	#tracker fields
	created = ndb.DateTimeProperty(auto_now_add=True)	
	last_modified = ndb.DateTimeProperty(auto_now=True)

	@classmethod # This means you can call a method directly on the Class (no on a Class Instance)
	def get_by_theory_id(cls, theory_id):
		return Theory.get_by_id(theory_id)

	@classmethod
	def get_by_email(cls, email):
		return Theory.query(Theory.email == email).get()


class VIPlist(ndb.Model):
	email = ndb.StringProperty(required=True)
	allow_new_password = ndb.BooleanProperty(default=True)

	created = ndb.DateTimeProperty(auto_now_add=True)
	last_modified = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def get_by_email(cls, email):
		return VIPlist.query(VIPlist.email == email).get()


class GameLog(ndb.Model):
	theory_id = ndb.KeyProperty(kind=Theory, required=True)
	created = ndb.DateTimeProperty(auto_now_add=True)
	user_date = ndb.DateTimeProperty(required=True)

	attempt = ndb.IntegerProperty(default=0)		
	streak_day = ndb.IntegerProperty(default=0)
	
	piggy_bank_sod = ndb.IntegerProperty(default=0)
	piggy_bank_eod = ndb.IntegerProperty(default=0)

	merits_goal = ndb.IntegerProperty(default=0) 
	merits_earned = ndb.IntegerProperty(default=0)
	merits_loss = ndb.IntegerProperty(default=0)
	
	slack_cut = ndb.FloatProperty(default=0) #If a slack cutter was used will be reflected here
	streak_merits = ndb.IntegerProperty(default=0)
	used_50_slack_cut = ndb.IntegerProperty(default=0)
	used_100_slack_cut = ndb.IntegerProperty(default=0)
	available_50_slack_cut = ndb.IntegerProperty(default=0)
	available_100_slack_cut = ndb.IntegerProperty(default=0)

	ev_piggy_bank_sod = ndb.IntegerProperty(default=0)
	ev_piggy_bank_eod = ndb.IntegerProperty(default=0)
	ev_merits_goal = ndb.IntegerProperty(default=0) 
	ev_merits_earned = ndb.IntegerProperty(default=0)


class KSU(ndb.Model):
	theory_id = ndb.KeyProperty(kind=Theory, required=True)	
	created = ndb.DateTimeProperty(auto_now_add=True)
	ksu_type = ndb.StringProperty()
	ksu_subtype = ndb.StringProperty()
	reason_id = ndb.KeyProperty()

	description = ndb.StringProperty(required=True)	
	pic_key = ndb.BlobKeyProperty()
	pic_url = ndb.StringProperty()

	size = ndb.IntegerProperty(default=3) #Indicates the size of a LifePiece or Objective. In a fibonacci scale 1, 2, 3, 5, 8. Also works as effor denominator for Actions
	counter = ndb.IntegerProperty(default=0) #Total minutes invested/Reps
	event_date = ndb.DateTimeProperty()

	status = ndb.StringProperty() #Wish, Present, Past #Remplaza is_realized e is_active #Indicates if a 'LifePiece' is either a wish or a RTBG or part of my life situation. And if an objective is acomplished or not.
	importance = ndb.IntegerProperty(default=0)

	in_graveyard = ndb.BooleanProperty(default=False) 
	needs_mtnc = ndb.BooleanProperty(default=False) #Indicates if a 'LifePiece' requires additional effort to be preserved on a realized state 	
	is_private = ndb.BooleanProperty(default=False)
	anywhere = ndb.BooleanProperty(default=False)
	monitor = ndb.BooleanProperty(default=False)

	comments = ndb.TextProperty()
	tag = ndb.StringProperty()
	
	money_cost = ndb.IntegerProperty(default=0)
	details = ndb.JsonProperty(default={}) # Subtype details. E.g. Birthday for a person, or exceptions for KAS4, Triggers for KAS3, cost for stuff	
	

class Event(ndb.Model):
	theory_id = ndb.KeyProperty(kind=Theory, required=True)	
	ksu_id = ndb.KeyProperty(kind=KSU, required=True)
	game_log_key = ndb.KeyProperty(kind=GameLog)

	description = ndb.StringProperty()
	reason_status = ndb.StringProperty()
	created = ndb.DateTimeProperty(auto_now_add=True)	
	event_date = ndb.DateTimeProperty(required=True) #User date

	event_type = ndb.StringProperty(required=True)
	score = ndb.IntegerProperty(default=0)
	size = ndb.IntegerProperty(default=1)	
	counter = ndb.IntegerProperty(default=1)