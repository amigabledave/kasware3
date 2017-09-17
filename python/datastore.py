from google.appengine.ext import ndb

#--- datastore classes ----------

class Theory(ndb.Model):

	#login details
	email = ndb.StringProperty(required=True)
	valid_email = ndb.BooleanProperty(default=False)
	password_hash = ndb.StringProperty(required=True)

	#user details	
	first_name = ndb.StringProperty(required=True)
	last_name = ndb.StringProperty(required=True)
	owner = ndb.StringProperty() #ID of user that owns this theory. Esto lo voy usar cuando permita log-in con una cuenta de Google
	
 	#user settings
 	language = ndb.StringProperty(choices=('Spanish', 'English'), default='English')
 	hide_private_ksus = ndb.BooleanProperty(default=False)
 	timezone = ndb.IntegerProperty(default=-6) #Deberia de ser forzoza, pero para evitar errores por ahora no la solicito asi
 	
 	# day_start_time = ndb.TimeProperty() - TBD
 	categories = ndb.JsonProperty(required=True)
 	size = ndb.IntegerProperty(default=0)

 	#Game details
	game = ndb.JsonProperty(default={
		'daily_goal':100,
		'critical_burn':10,
		'mission_burn':5,
		'last_log':None,
		'goal_achieved':False,
		'points_today':0,
		'points_to_goal':100,
		
		'todays_goal':100,

		'discipline_lvl':0,
		'streak':0,
		'piggy_bank':0,
	
		'best_points_today':0,
		'best_discipline_lvl':0,
		'best_streak':0,
		'best_piggy_bank':0,
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

	@classmethod
	def valid_login(cls, email, password):
		theory = cls.get_by_email(email)
		if theory and validate_password(email, password, theory.password_hash):
			return theory


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


class KSU3(ndb.Model):
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
	
	in_graveyard = ndb.BooleanProperty(default=False) 
	needs_mtnc = ndb.BooleanProperty(default=False) #Indicates if a 'LifePiece' requires additional effort to be preserved on a realized state 	
	is_private = ndb.BooleanProperty(default=False)
	anywhere = ndb.BooleanProperty(default=False)
	monitor = ndb.BooleanProperty(default=False)

	comments = ndb.TextProperty()
	tag = ndb.StringProperty()
	
	money_cost = ndb.IntegerProperty(default=0)
	details = ndb.JsonProperty(default={}) # Subtype details. E.g. Birthday for a person, or exceptions for KAS4, Triggers for KAS3, cost for stuff	
	

class Event3(ndb.Model):
	theory_id = ndb.KeyProperty(kind=Theory, required=True)	
	ksu_id = ndb.KeyProperty(kind=KSU3, required=True)
	game_log_key = ndb.KeyProperty(kind=GameLog)

	description = ndb.StringProperty()
	reason_status = ndb.StringProperty()
	created = ndb.DateTimeProperty(auto_now_add=True)	
	event_date = ndb.DateTimeProperty(required=True) #User date

	event_type = ndb.StringProperty(required=True)
	score = ndb.IntegerProperty(default=0)
	size = ndb.IntegerProperty(default=1)	
	counter = ndb.IntegerProperty(default=1)


class KSU(ndb.Model):

	theory = ndb.KeyProperty(kind=Theory, required=True)	
	created = ndb.DateTimeProperty(auto_now_add=True)	
	last_modified = ndb.DateTimeProperty(auto_now=True)

	description = ndb.StringProperty(required=True)
	secondary_description = ndb.StringProperty()

	comments = ndb.TextProperty()
	ksu_type = ndb.StringProperty()
	ksu_subtype = ndb.StringProperty()
	kpts_value = ndb.FloatProperty()

	importance = ndb.IntegerProperty(default=3)
	tags = ndb.StringProperty()
	parent_id = ndb.KeyProperty() # Ahora me esta dando un error porque lo estoy ligando a la misma clase que estoy definiendo
		
	is_active = ndb.BooleanProperty(default=True)
	is_critical = ndb.BooleanProperty(default=False)
	is_private = ndb.BooleanProperty(default=False)

	is_visible = ndb.BooleanProperty(default=True)
	in_graveyard = ndb.BooleanProperty(default=False)
	is_deleted = ndb.BooleanProperty(default=False)			

	next_event = ndb.DateProperty()
	pretty_next_event = ndb.StringProperty()
	frequency = ndb.IntegerProperty(default=1)
	repeats = ndb.StringProperty() # KAS1 Specific		
	repeats_on = ndb.JsonProperty() #Day's of the week when it repeats if the frequency is Weekly, elese the repetition date is the same day of the month or year
	
	mission_view = ndb.StringProperty(default='Principal')
	best_time = ndb.TimeProperty()
	pretty_best_time = ndb.StringProperty()

	is_mini_o = ndb.BooleanProperty(default=False)
	is_jg = ndb.BooleanProperty(default=False)
	target = ndb.JsonProperty() # For ksus that generate kpts and indicators target min, target max, reverse target etc
	birthday = ndb.DateProperty()
	
	timer = ndb.JsonProperty(default={'hours':0, 'minutes':0, 'seconds':0, 'value':'00:00:00'})
	cost = ndb.JsonProperty(default={'money_cost':0, 'days_cost':0, 'hours_cost':0})

	picture = ndb.BlobProperty() #Might be used in the future
	times_reviewed = ndb.IntegerProperty(default=0)
	next_critical_burn = ndb.IntegerProperty() #Define siguiente fecha como ordinal en la que si no se cumplio la accion esta quema

	effort_denominator = ndb.IntegerProperty(default=3)
	wish_type = ndb.StringProperty(default='doing')
	ImIn_details = ndb.JsonProperty(default={'positive_label':'Delighted', 'neutral_label':'Satisfied', 'negative_label':'Dissapointed', 'units':'Units'})
	

class Event(ndb.Model):

	#tracker fields
	theory = ndb.KeyProperty(kind=Theory, required=True)
	ksu_id = ndb.KeyProperty(kind=KSU, required=True)
	parent_id = ndb.KeyProperty(kind=KSU)	
	created = ndb.DateTimeProperty(auto_now_add=True)	
	last_modified = ndb.DateTimeProperty(auto_now=True)
	is_deleted = ndb.BooleanProperty(default=False)

	# base properties
	user_date_date = ndb.DateTimeProperty(required=True)	
	user_date = ndb.IntegerProperty(required=True)
	event_type = ndb.StringProperty(required=True)
	
	comments = ndb.TextProperty()
	secondary_comments = ndb.StringProperty() #Para ponerle titulos a los eventos cuando aplique
	is_private = ndb.BooleanProperty(default=False)
	importance = ndb.IntegerProperty(default=3) #No me acuerdo para que era la importancia en el evento. Puede volver a servir despues como denominador

	#Score properties
	kpts_type = ndb.StringProperty()
	score = ndb.FloatProperty(default=0)
	quality = ndb.StringProperty()

	#KSU properties
	ksu_description = ndb.StringProperty()
	ksu_secondary_description = ndb.StringProperty()	
	ksu_subtype = ndb.StringProperty()
	ksu_tags = ndb.StringProperty()



#--- Validation and security functions ----------
import hashlib, random

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



### Might be used in the future
# class Tag(ndb.Model):
	
# 	theory = ndb.KeyProperty(kind=Theory, required=True)
# 	created = ndb.DateTimeProperty(auto_now_add=True)		
# 	last_modified = ndb.DateTimeProperty(auto_now=True)
	
# 	name = ndb.StringProperty(required=True)
# 	description = ndb.StringProperty()
# 	ksus = ndb.KeyProperty(kind=Theory, repeated=True)	#all KSUs related to this tag
