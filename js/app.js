// $('.UserActionButton').on('click', function(){
$(document).on('click', '.UserActionButton', function(){
	console.log('Si esta detectando que se aprieta el boton');
	var ksu = $(this).closest('#MissionKSU');
	var ksu_id = ksu.attr("value");
	var user_action = $(this).attr("value");
	var kpts_value = ksu.find('#kpts_value').val();
	var event_comments = ksu.find('#event_comments').val()
	var event_secondary_comments = ksu.find('#event_secondary_comments').val()
	var event_quality = ksu.find('#event_quality option:selected').val()

	var is_mini_o = ksu.find('#is_mini_o').is(':checked');

	var dissapear_before_done = ['MissionDone', 'MissionPush', 'MissionSkip' ,'MissionDelete', 'ViewerDelete','GraveyardDelete', 'GraveyardReanimate', 'MissionRecordValue']


	if (!is_mini_o) {
		if ($.inArray(user_action, dissapear_before_done)!= -1 && !is_mini_o ){
			ksu.animate({
				"opacity" : "0",
				},{
					"complete" : function() {
					ksu.remove();
					}
				})
			};
	} else {
		ksu.fadeOut("slow")
		setTimeout(function(){
			if (user_action == 'MissionDone'){
				ksu.find('#secondary_description').val('');
				ksu.find('#best_time').val('');
				ksu.find('#kpts_value').val(1);
			} else {
				ksu.remove()
			}
			ksu.fadeIn("fast")
		},500);
		
	};


	if (user_action == 'ReactiveMissionDone'){
		user_action = 'MissionDone'};


	if (user_action == 'MissionRecordValue' || user_action == 'ViewerRecordValue'){
		user_action = 'RecordValue'
		kpts_value = ksu.find('#select_indicator_value option:selected').val()
		
		if(kpts_value == undefined){
			kpts_value = ksu.find('#open_indicator_value').val()};	
		};

	if(kpts_value == undefined){
		kpts_value = 0};

	if(event_comments == undefined){
		event_comments = ''};

	if(event_secondary_comments == undefined){
		event_secondary_comments = ''};		

	$.ajax({
		type: "POST",
		url: "/EventHandler",
		dataType: 'json',
		data: JSON.stringify({
			'ksu_id': ksu_id,
			'user_action': user_action,
			'kpts_value':kpts_value,
			'event_comments':event_comments,
			'event_secondary_comments':event_secondary_comments,
			'event_quality': event_quality
		})
	})
	.done(function(data){
		console.log(data);
		var EventScore = data['EventScore'];
		var kpts_type = data['kpts_type'];
		// var PointsToGoal = data['PointsToGoal']
		var PointsToday = data['PointsToday']

		// if ( PointsToGoal <= 0){
		// 	PointsToGoal = 'Achieved!'
		// }; 
	
		// $('#PointsToGoal').text(' ' + PointsToGoal);
		$('#PointsToday').text(' ' + PointsToday);
		$('#EffortReserve').text(' ' + data['EffortReserve']);
		$('#Streak').text(' ' + data['Streak']);


		if ($.inArray(user_action, dissapear_before_done)!= -1){
			$('#MissionValue').text(parseFloat($('#MissionValue').text())-data['kpts_value']);
		};

		var ksu_subtype = data['ksu_subtype'];

		if (user_action == 'SendToMission' || user_action == 'ViewerDone' || user_action == 'RecordValue'){
			ksu.find('#pretty_next_event').text(data['pretty_next_event']);
		};

		if (user_action == 'ViewerOnOff'){
			console.log(data['is_active'])
			if (data['is_active']){
				ksu.find('#is_active').css({'color': 'black'});
				ksu.find('#ViewerOnOffButton').removeClass('btn-success');
				ksu.find('#ViewerOnOffButton').addClass('btn-warning');
			} else {
				ksu.find('#is_active').css({'color': '#b1adad'});
				ksu.find('#ViewerOnOffButton').removeClass('btn-warning');
				ksu.find('#ViewerOnOffButton').addClass('btn-success');				
			}

		};
		
		var dissapear_after_done_subtypes = ['KAS2', 'Wish', 'BigO'];
		var dissapear_after_done_actions = ['ViewerDone'];


		if (is_mini_o) {
			var target_timer = ksu.find('#ksu_timer');
			    target_timer.attr("seconds", 0);
			    target_timer.attr("minutes", 0);
			    target_timer.attr("hours", 0);
			    target_timer.text('00:00:00')
		}

		if (($.inArray(ksu_subtype, dissapear_after_done_subtypes)!= -1) && ($.inArray(user_action, dissapear_after_done_actions)!= -1)){
			ksu.animate({
				"opacity" : "0",
				},{
					"complete" : function() {
					ksu.remove();
					}
				})
			};

	});
});


$('.SaveNewKSUButton').on('click', function(){
	var ksu = $(this).closest('#NewKSU');
	var ksu_type = ksu.attr("ksutype");
	var ksu_subtype = ksu.attr("ksusubtype");
	var parent_id = ksu.find('#parent_id').val();
	console.log('This is the first current parent id:')
	console.log(parent_id)
	if (parent_id == undefined){
		parent_id = ksu.find('#parent_id option:selected').val();
	};
	console.log('This is the second current parent id:')
	console.log(parent_id)

	var is_jg = ksu.find('#is_jg').is(':checked');
	var effort_denominator = 3;
	console.log(ksu_type)
	if (is_jg || ksu_type == 'EVPo'){
		effort_denominator = ksu.find('input:radio[name=jg_size]:checked').val();
	}
	console.log(effort_denominator)
	var wish_type = ksu.find('#wish_type option:selected').val();

	var description = ksu.find('#description').val();
	var secondary_description = ksu.find('#secondary_description').val();
	var next_event = ksu.find('#next_event').val();
	var best_time = ksu.find('#best_time').val();
	var kpts_value = ksu.find('#kpts_value').val();

	var mission_view = ksu.find('#mission_view').val()
	var importance = ksu.find('#importance').val();

	var tags = ksu.find('#tags_value').val();
	var comments = ksu.find('#comments').val();

	var frequency = ksu.find('#frequency').val();
	var repeats = ksu.find('#repeats').val();		

	var is_active = ksu.find('#is_active').is(':checked');
	var is_critical = ksu.find('#is_critical').is(':checked');
	var is_private = ksu.find('#is_private').is(':checked');
	
	var repeats_on_Mon = ksu.find('#repeats_on_Mon').is(':checked');
	var repeats_on_Tue = ksu.find('#repeats_on_Tue').is(':checked'); 
	var repeats_on_Wed = ksu.find('#repeats_on_Wed').is(':checked'); 
	var repeats_on_Thu = ksu.find('#repeats_on_Thu').is(':checked');
	var repeats_on_Fri = ksu.find('#repeats_on_Fri').is(':checked');
	var repeats_on_Sat = ksu.find('#repeats_on_Sat').is(':checked');
	var repeats_on_Sun = ksu.find('#repeats_on_Sun').is(':checked');

	var money_cost = ksu.find('#money_cost').val();
	var days_cost = ksu.find('#days_cost').val();
	var hours_cost = ksu.find('#hours_cost').val();
	var birthday = ksu.find('#birthday').val();

	var is_mini_o = ksu.find('#is_mini_o').is(':checked');

	
	if (description == ''){
		description = ksu.find('#description').text();
		secondary_description = ksu.find('#secondary_description').text();
	};

	if ((ksu_type == 'BigO' || ksu_type == 'Wish' ) && kpts_value == '0.25'){
		kpts_value = 1
	}

	ksu.fadeOut("slow")
	
	$.ajax({
		type: "POST",
		url: "/EventHandler",
		dataType: 'json',
		data: JSON.stringify({
			'user_action': 'SaveNewKSU',
			'ksu_type': ksu_type,
			'ksu_subtype': ksu_subtype,
			'parent_id': parent_id,

			'effort_denominator':effort_denominator,
			'wish_type': wish_type,


			'description':description,
			'secondary_description':secondary_description,
			'next_event':next_event,
			'best_time':best_time,
			'kpts_value': kpts_value,
			
			'mission_view':mission_view,
			'tags':tags,
			'comments':comments, 
		
			'is_active':is_active,
			'is_critical':is_critical, 
			'is_private':is_private,

			'frequency':frequency,
			'repeats':repeats,
	
			'repeats_on_Mon':repeats_on_Mon,
			'repeats_on_Tue':repeats_on_Tue,
			'repeats_on_Wed':repeats_on_Wed,
			'repeats_on_Thu':repeats_on_Thu,
			'repeats_on_Fri':repeats_on_Fri,
			'repeats_on_Sat':repeats_on_Sat,
			'repeats_on_Sun':repeats_on_Sun,

			'money_cost':money_cost,
			'days_cost':days_cost,
			'hours_cost':hours_cost,
			'birthday':birthday,
			'is_mini_o':is_mini_o,
			'is_jg': is_jg

		})
	})
	.done(function(data){
		console.log(data);
		ksu.find('#description').val('');
		ksu.find('#comments').val('');
		ksu.find('#is_critical').prop('checked', false);
		ksu.find('#is_private').prop('checked', false);
		ksu.find('#is_active').prop('checked', true);
		ksu.find('#is_mini_o').prop('checked', false);
		
		ksu.find('#secondary_description').val('');
		ksu.find('#BigO_secondary_description').val('');
		ksu.find('#KAS3_secondary_description').val('');
		ksu.find('#KAS4_secondary_description').val('');
		ksu.find('#EVPo_secondary_description').val('');
		ksu.find('#ImPe_secondary_description').val('');
		ksu.find('#Idea_SecondaryDescription').val('');

		ksu.find('#best_time').val('');
		ksu.find('#ImIn_best_time').val('');
		ksu.find('#Diary_best_time').val('');

		// ksu.find('#next_event').val('');
		ksu.find('#BigO_next_event').val('');
		ksu.find('#EVPo_next_event').val('');
		ksu.find('#ImPe_next_event').val('')
		ksu.find('#ImIn_next_event').val('')
		ksu.find('#Diary_next_event').val('')
		
		ksu.find('#tags_value').val('');
		ksu.find('#Dummy_tags_value').val('');			
		
		ksu.find('#importance').val(3);

		ksu.find('#kpts_value').val(1);
		ksu.find('#KAS3_kpts_value').val(1);
		ksu.find('#KAS4_kpts_value').val(1);
		ksu.find('#BigO_kpts_value').val(1);
		ksu.find('#Wish_kpts_value').val(1);
		ksu.find('#EVPo_kpts_value').val(1);
		ksu.find('#ImPe_kpts_value').val(1);

		ksu.find('#frequency').val('');
		ksu.find('#EVPo_frequency').val('');
		ksu.find('#ImPe_frequency').val('');
		ksu.find('#ImIn_frequency').val('');
		ksu.find('#Diary_frequency').val('');

		ksu.find('#money_cost').val('');
		ksu.find('#days_cost').val('');
		ksu.find('#hours_cost').val('');
		ksu.find('#birthday').val('');

		
		if (ksu_subtype == ''){
			ksu_subtype = ksu_type
		};


		var Templates = {
			'KeyA': $('#NewKSUTemplate_KeyA').clone(),
			'KAS1': $('#NewKSUTemplate_KAS1').clone(),
			'KAS2': $('#NewKSUTemplate_KAS2').clone(),
			'KAS3': $('#NewKSUTemplate_KAS3').clone(),
			'KAS4': $('#NewKSUTemplate_KAS4').clone(),
			
			'BigO': $('#NewKSUTemplate_BigO').clone(),
			'Wish': $('#NewKSUTemplate_Wish').clone(),
			
			'EVPo': $('#NewKSUTemplate_EVPo').clone(),
			'ImPe': $('#NewKSUTemplate_ImPe').clone(),
			'Idea': $('#NewKSUTemplate_Idea').clone(),
			'RTBG': $('#NewKSUTemplate_RTBG').clone(),

			'RealitySnapshot': $('#NewKSUTemplate_RealitySnapshot').clone(),
			'BinaryPerception': $('#NewKSUTemplate_BinaryPerception').clone(),
			'TernaryPerception': $('#NewKSUTemplate_TernaryPerception').clone(),
			'FibonacciPerception': $('#NewKSUTemplate_FibonacciPerception').clone(),
			'Diary': $('#NewKSUTemplate_Diary').clone()
		}

 
		var new_ksu = Templates[ksu_subtype];

		kpts_value = data['kpts_value'];

		new_ksu.attr("id", "MissionKSU");
		new_ksu.attr("value",data['ksu_id']);
		new_ksu.find('#ksu_id').attr("value",data['ksu_id']);
		new_ksu.find('#parent_id').val(parent_id);

		new_ksu.find('#description').val(description);
		new_ksu.find('#secondary_description').val(secondary_description);
		new_ksu.find('#kpts_value').val(kpts_value);
		new_ksu.find('#best_time').val(best_time);
		new_ksu.find('#next_event').val(next_event);

		new_ksu.find('#importance').val(data['importance']);
		new_ksu.find('input:radio[name=effort_denominator][value='+ effort_denominator +']').prop("checked",true);
		new_ksu.find('input:radio[name=jg_size][value='+ effort_denominator +']').prop("checked",true);

		new_ksu.find('#tags').val(tags);
		new_ksu.find('#ksu_subtype').text(ksu_subtype);

		new_ksu.find('#is_critical').prop('checked', is_critical);
		new_ksu.find('#is_active').prop('checked', is_active);
		new_ksu.find('#is_private').prop('checked', is_private);

		new_ksu.find('#money_cost').val(money_cost);
		new_ksu.find('#hours_cost').val(hours_cost);
		new_ksu.find('#days_cost').val(days_cost);
		new_ksu.find('#birthday').val(birthday);
		new_ksu.find('#is_mini_o').prop('checked', is_mini_o);
		new_ksu.find('#is_jg').prop('checked', is_jg);

		new_ksu.find('#frequency').val(frequency);
		new_ksu.find('#comments').val(comments);

		new_ksu.removeClass('hidden');
		new_ksu.prependTo('#NewKSUsHolder');
		new_ksu.fadeIn("slow");

		if(is_critical && is_active){
			new_ksu.find('#description').css('color', '#B22222');				
		} else if (is_active){
			new_ksu.find('#description').css('color', 'black');				
		} else {
			new_ksu.find('#description').css('color', '#b1adad');
		};

		if(is_mini_o){
			new_ksu.find('#description').css('font-weight', 'bold');
			new_ksu.find('#secondary_description').removeClass('hidden');
			ksu.find('#description').css('font-weight', 'normal');
			ksu.find('#description').css('font-style', 'normal');
			ksu.find('#secondary_description').addClass('hidden');
		};

		if(is_jg){
			new_ksu.find('#ExpectedImpactRow').toggleClass('hidden');
			new_ksu.find('#JGSizeRow').toggleClass('hidden');
			new_ksu.find('#ksu_timer').toggleClass('hidden');
			new_ksu.find('#ksu_timer_button').toggleClass('hidden');
		}

		$('#TagsAndImportanceRow').addClass('hidden');	
		$('#QuickKsuSecondaryDescription').addClass('hidden');
		$('#QuickKsuSubtypeDetails').addClass('hidden');
		ksu.fadeIn("slow");

		
		var TodayDate = new Date().toJSON().slice(0,10).replace(/-/g,'-');
		if(next_event > TodayDate){
			new_ksu.animate({
				"opacity" : "0",},{
				"complete" : function(){
					new_ksu.remove();
				}
			})
			console.log('Evento en el futuro');
		};



	});
});


$('#NewDiaryEntryButton').on('click', function(){
	// console.log('Si esta detectando que se aprieta el boton');
	var ksu = $('#NewDiaryEntry');
	console.log(ksu);
	console.log('Se supone que ya se deberia de haber detectado el KSU')
	var ksu_id = ksu.attr("value");
	var user_action = 'RecordValue';
	var is_private = ksu.find('#is_private').is(':checked');
	var importance = ksu.find('#importance').val()

	var event_comments = ksu.find('#comments').val()
	var event_secondary_comments = ksu.find('#secondary_comments').val()

	var dissapear_before_done = ['RecordValue']

	ksu.fadeOut("slow")

	$.ajax({
		type: "POST",
		url: "/EventHandler",
		dataType: 'json',
		data: JSON.stringify({
			'ksu_id': ksu_id,
			'user_action': user_action,
			'is_private': is_private,
			'importance':importance,
			'kpts_value':0,
			'event_comments':event_comments,
			'event_secondary_comments':event_secondary_comments
		})
	})
	.done(function(data){

		ksu.find('#comments').val('');
		ksu.find('#secondary_comments').val('');
		ksu.find('#importance').val(3);		
		ksu.find('#is_private').prop('checked', false);

		var new_ksu = $('#NewDiaryEntry_Template').clone();
		
		new_ksu.attr("id", "MissionKSU");
		new_ksu.attr("value",data['event_id']);		

		new_ksu.find('#comments').val(event_comments);
		new_ksu.find('#secondary_comments').val(event_secondary_comments);
		new_ksu.find('#importance').val(importance);
				
		new_ksu.find('#event_pretty_datet').val(data['pretty_event_date']);
		new_ksu.find('#is_private').prop('checked', is_private);

		new_ksu.removeClass('hidden');
		new_ksu.prependTo('#NewEventHolder');
		new_ksu.fadeIn("slow");

		ksu.fadeIn("slow");
	});
});


$('#LogInButton').on('click', function(){
	var email = $('#login_email').val();
	var password = $('#login_password').val();

	$.ajax({
		type: "POST",
		url: "/SignUpLogIn",
		dataType: 'json',
		data: JSON.stringify({
			'user_action': 'LogIn',
			'email':email,
			'password':password		
		})
	})
	.done(function(data){
		var next_step = data['next_step'];
		console.log(next_step);

		if (next_step == 'GoToYourTheory'){
			window.location.href = '/MissionViewer?time_frame=Today'
		};

		if (next_step == 'TryAgain'){
			$('#InvalidEmailOrPasswordError').removeClass('hidden');			
			
		};
	})		
});


$('#SignUpButton').on('click', function(){
	console.log('ya se dio cuenta que quiero hacer sign up')
	var first_name = $('#first_name').val()
	var last_name = $('#last_name').val()
	var email = $('#email').val()
	var confirm_email = $('#confirm_email').val()
	var password = $('#password').val()

	$.ajax({
		type: "POST",
		url: "/SignUpLogIn",
		dataType: 'json',
		data: JSON.stringify({
			'user_action': 'SignUp',
			'first_name': first_name,
			'last_name':last_name,
			'email':email,
			'confirm_email':confirm_email,
			'password':password		
		})
	})
	.done(function(data){
		var next_step = data['next_step'];
		console.log(next_step);

		if (next_step == 'CheckYourEmail'){
			window.location.href = '/Accounts?user_request=create_account'			
		};

		if (next_step == 'TryAgain'){
			$('#input_error').text(data['input_error'])						
			
		};
	})		
});


$('#PasswordResetButton').on('click', function(){
	var theory_id = $('#theory_id').val()
	var password_hash = $('#password_hash').val()
	var new_password = $('#NewPassword').val()
	$.ajax({
		type: "POST",
		url: "/Accounts",
		dataType: 'json',
		data: JSON.stringify({
			'user_action': 'SetNewPassword',
			'new_password': new_password,
			'theory_id':theory_id,
			'password_hash':password_hash		
		})
	})
	.done(function(data){
		var next_step = data['next_step'];
		console.log(next_step);

		if (next_step == 'EnterValidPassword'){
			$('#InvalidPasswordError').removeClass('hidden');

		};

		if (next_step == 'GoToYourTheory'){
			// window.location.href = '/MissionViewer?time_frame=Today'
			$('#enter_new_password').toggleClass('hidden');
			$('#password_reseted').toggleClass('hidden');
			
		};
	})		
});


$('#RequestPasswordReset').on('click', function(){
	var user_email = $('#user_email').val()
	$.ajax({
		type: "POST",
		url: "/Accounts",
		dataType: 'json',
		data: JSON.stringify({
			'user_action': 'RequestPasswordReset',
			'user_email': user_email,			
		})
	})
	.done(function(data){
		var next_step = data['next_step'];
		console.log(next_step);

		if (next_step == 'EnterValidEmail'){
			$('#InvalidEmailError').removeClass('hidden');
		};

		if (next_step == 'CheckYourEmail'){
			$('#request_reset_email').toggleClass('hidden');
			$('#reset_email_sent').toggleClass('hidden');
		};
	})		
});


$('#MobileTheorySearchButton').on('click', function(){		
	$('#MobileSearchBar').toggleClass('hidden');	
});


$('#ShowHideTagContents').on('click', function(){		
	$('.tag_content').toggleClass('hidden');
	
	var GlaphiconDiv = $('.TagPlusMinus');
	
	GlaphiconDiv.toggleClass('glyphicon-minus');
	GlaphiconDiv.toggleClass('glyphicon-plus');	
});


$(document).on('focusout', '.SettingsTag', function(){
	var original_tag = $(this).attr("originaltag");
	var new_tag = $(this).val();
	
	console.log(original_tag);
	console.log(new_tag);

	$.ajax({
		type: "POST",
		url: "/EventHandler",
		dataType: 'json',
		data: JSON.stringify({
			'user_action': 'UpdateSettingsTag',
			'original_tag': original_tag,
			'new_tag':new_tag,
		})
	})
	.done(function(data){
		console.log('Tag Succesfully Updated');
	})
});


$('.ExpandColapseSection').on('click', function(){
	var target_section = $(this).attr("targetsection")
	$(target_section).toggleClass('hidden');

	var GlaphiconDiv = $(this).find('#PlusMinusGlyphicon');
	GlaphiconDiv.toggleClass('glyphicon-minus');
	GlaphiconDiv.toggleClass('glyphicon-plus');	
});


$('#ShowHideReactiveMission').on('click', function(){
		
	$('#reactive_mission').toggleClass('hidden');
	// $('#ActionsToExecuteSubTitle').toggleClass('hidden');	
	$('#Upcoming').toggleClass('hidden');
	$('#someday_maybe').toggleClass('hidden');

	var GlaphiconDiv = $('#MissionPlusMinusGlyphicon');
	GlaphiconDiv.toggleClass('glyphicon-minus');
	GlaphiconDiv.toggleClass('glyphicon-plus');	

	var time_frame = $(this).attr("timeframe");
	if( time_frame == 'Upcoming'){
		$('#SomedayMaybeTitle').toggleClass('hidden');
		$('#MissionTitle').toggleClass('hidden');
	};
});


$('.MiniObjectiveCheckbox').on('change',function(){
	console.log('Si se dio cuenta de que es un mini o');
	var ksu = $(this).closest('#NewKSU');
	if (ksu.attr("value") != 'NewKSU'){
		ksu = $(this).closest('#MissionKSU')
	};
	
	var is_mini_o = ksu.find('#is_mini_o').is(':checked');

	if (is_mini_o){
		ksu.find('#description').css({'font-weight': 'bold'});
		ksu.find('#description').css({'font-style':'italic'}); 
	} else {
		ksu.find('#description').css({'font-weight': 'normal'});
		ksu.find('#description').css({'font-style':'normal'}); 
	}
	
	ksu.find('#secondary_description').toggleClass('hidden');
});



$('.JoyGeneratorCheckbox').on('change',function(){
	var ksu = $(this).closest('#NewKSU');
	if (ksu.attr("value") != 'NewKSU'){
		ksu = $(this).closest('#MissionKSU')
	};

	ksu.find('#ExpectedImpactRow').toggleClass('hidden');
	ksu.find('#JGSizeRow').toggleClass('hidden');
	ksu.find('#ksu_timer').toggleClass('hidden');
	ksu.find('#ksu_timer_button').toggleClass('hidden');	
});


// xx
$('.DummyInput').on('change',function(){
	var ksu = $(this).closest('#NewKSU');
	var ksu_attr = $(this).attr("ksuattr");
 	console.log(ksu_attr)
	console.log(this.value)

	if (ksu_attr == 'mission_view'){
		$('#mission_view').val(this.value);
	};

	if (ksu_attr == 'kpts_value'){
		$('#kpts_value').val(this.value);
	};

	if (ksu_attr == 'next_event'){
		$('#next_event').val(this.value);
	};

	if (ksu_attr == 'frequency'){
		$('#frequency').val(this.value);
	};

	if (ksu_attr == 'secondary_description'){
		$('#secondary_description').val(this.value);
	};

	if (ksu_attr == 'birthday'){
		$('#birthday').val(this.value);
	};

	if (ksu_attr == 'best_time'){
		$('#best_time').val(this.value);
	};

	if (ksu_attr == 'parent_id'){
		ksu.find('#parent_id').val(this.value);
	};

	if (ksu_attr == 'tags_value'){
		$(this).closest('#NewKSU').find('#tags_value').val(this.value);
	};

	if (ksu_attr == 'importance'){
		$(this).closest('#NewKSU').find('#importance').val(this.value);
	};

	if (ksu_attr == 'tags'){
		$(this).closest('#MissionKSU').find('#tags').val(this.value);
	};

	if (ksu_attr == 'wish_type'){
		$('#wish_type').val(this.value);
	};


});


$('.QuickKsuDescription').on('focusin', function(){
	$('#QuickKsuSubtypeDetails').removeClass('hidden');
	$('#TagsAndImportanceRow').removeClass('hidden');	
	$('#QuickKsuSecondaryDescription').removeClass('hidden');
});


$('#ksu_type').on('change',function(){

	if (this.value == 'KeyA'){
		$('#KeyA').removeClass('hidden');
		if ($('#ksu_id').val() == ''){
			$('#KAS1').prop("checked", true);
			$('#KeyA_KAS1').removeClass('hidden');
		}

	} else {
		$('#KeyA').addClass('hidden');
	}	

	if (this.value == 'OTOA'){
		$('#OTOA').removeClass('hidden');
	} else {
		$('#OTOA').addClass('hidden');
	}

	if (this.value == 'BigO'){
		$('#BigO').removeClass('hidden');
	} else {
		$('#BigO').addClass('hidden');
	}

	if (this.value == 'Wish'){
		$('#Wish').removeClass('hidden');
	} else {
		$('#Wish').addClass('hidden');
	}

	if (this.value == 'EVPo'){
		$('#EVPo').removeClass('hidden');
	} else {
		$('#EVPo').addClass('hidden');
	}

	if (this.value == 'Idea'){
		$('#Idea').removeClass('hidden');
	} else {
		$('#Idea').addClass('hidden');
	}

	if (this.value == 'ImPe'){
		$('#ImPe').removeClass('hidden');
	} else {
		$('#ImPe').addClass('hidden');
	}

	if (this.value == 'RTBG'){
		$('#RTBG').removeClass('hidden');
	} else {
		$('#RTBG').addClass('hidden');
	}

	if (this.value == 'ImIn'){
		$('#ImIn').removeClass('hidden');
	} else {
		$('#ImIn').addClass('hidden');
	}

	if (this.value == 'Diary'){
		$('#Diary').removeClass('hidden');
	} else {
		$('#Diary').addClass('hidden');
	}

	d_EditorTitle = {
		'Gene': 'KASware Standard Unit Editor',
		'KeyA': 'Key Action Editor',

		'BigO': 'Objective Editor',
		'Wish': 'Wish Editor',

		'EVPo': 'End Value Mine Editor',
		'ImPe': 'Important Person Editor',
		'RTBG': 'Reason To Be Grateful Editor',
		'Idea': 'Bit of Wisdom Editor',
		'ImIn': 'Indicator Editor'
	}

	$('#KsuEditorTitle').text(d_EditorTitle[this.value]);
});


$('input[type=radio][name=ksu_subtype]').on('change',function(){
	

	if (this.value == 'KAS1'){
		$('#KeyA_KAS1').removeClass('hidden');
	} else {
		$('#KeyA_KAS1').addClass('hidden');
	}

	if (this.value == 'KAS3'){
		$('#KeyA_KAS3').removeClass('hidden');
	} else {
		$('#KeyA_KAS3').addClass('hidden');	
	}

	if (this.value == 'KAS4'){
		$('#KeyA_KAS4').removeClass('hidden');		
	} else {
		$('#KeyA_KAS4').addClass('hidden');
		
	}

	if (this.value == 'KAS2'){
		$('#BOKA_Specific_TagsAndImportanceRow').removeClass('hidden');
		$('#BOKA_SecondaryDescription').addClass('hidden');
		$('#MiniO_Specific_TagsAndImportanceRow').addClass('hidden');
	}

	if (this.value == 'MiniO'){
		$('#MiniO_Specific_TagsAndImportanceRow').removeClass('hidden');
		$('#BOKA_SecondaryDescription').removeClass('hidden');
		$('#BOKA_Specific_TagsAndImportanceRow').addClass('hidden');
	}

	console.log('Se detecto el cambio de KSU_SUBTYPE');
	console.log(this.value);
	$('#NewKSU').attr("ksusubtype", this.value);
});


$('#repeats').on('change',function(){

	d_repeats_legend = {
	'R001':'Days',
	'R007':'Weeks',
	'R030':'Months',
	'R365':'Years'};

	if (this.value != 'R000') {
		$('#repeatsDetails').removeClass('hidden');
		if (this.value == 'R007'){
			$('#repeats_on').removeClass('hidden');
			$('#repeats_every').addClass('hidden');
		} else {
			$('#repeats_on').addClass('hidden');
			$('#repeats_every').removeClass('hidden');
		}
		$('#repeats_every_footnote').text(d_repeats_legend[this.value]);
	} else {
		$('#repeatsDetails').addClass('hidden');
	}
});


$(document).on('change', '.KsuEditor_Repeats', function(){

	var ksu = $(this).closest('#MissionKSU');

	d_repeats_legend = {
	'R001':'Days',
	'R007':'Weeks',
	'R030':'Months',
	'R365':'Years'};

	if (this.value != 'R000') {
		ksu.find('#repeatsDetails').removeClass('hidden');
		if (this.value == 'R007'){
			ksu.find('#repeats_on').removeClass('hidden');
			ksu.find('#repeats_every').addClass('hidden');
		} else {
			ksu.find('#repeats_on').addClass('hidden');
			ksu.find('#repeats_every').removeClass('hidden');
		}
		ksu.find('#repeats_every_footnote').text(d_repeats_legend[this.value]);
	} else {
		ksu.find('#repeatsDetails').addClass('hidden');
	}
});


function getURLParameter(url, name) {
    return (RegExp(name + '=' + '(.+?)(&|$)').exec(url)||[,null])[1];
}


$(document).on('click', '.RedirectUserButton', function(){
	var ksu = $(this).closest('#MissionKSU');
	var ksu_id = ksu.attr("value");
	var user_action = $(this).attr("value");

    current_url = return_to = window.location.href

    return_to = '&return_to=' + window.location.pathname

    var set_name = getURLParameter(current_url, 'set_name');
    if (set_name){
    	return_to = return_to + '?set_name=' + set_name 
    }
    var time_frame = getURLParameter(current_url, 'time_frame');
    if (time_frame){
    	return_to = return_to + '?time_frame=' + time_frame
    }
    
	if (user_action == 'EditKSU'){	
		window.location.href = '/KsuEditor?ksu_id=' + ksu_id + return_to;

	} else if ( user_action == 'ViewKSUHistory') {
		window.location.href = '/HistoryViewer?ksu_id='+ksu_id;
	
	} else if ( user_action == 'ViewBigOPlan') {
		window.location.href = '/SetViewer?set_name=BOKA&ksu_id='+ksu_id;

	} else if ( user_action == 'ViewDreamPlan') {
		window.location.href = '/SetViewer?set_name=BigO&ksu_id='+ksu_id;
	}
});


$('.DeleteEventButton').on('click', function(){
	var event = $(this).closest('#MissionKSU');
	var event_id = event.attr("value");
		
	event.fadeOut("slow")
	
	$.ajax({
		type: "POST",
		url: "/EventHandler",
		dataType: 'json',
		data: JSON.stringify({
			'user_action': 'DeleteEvent',
			'event_id': event_id,
		})
	})
	.done(function(data){
		console.log(data);

		// var PointsToGoal = data['PointsToGoal'];

		// if ( PointsToGoal <= 0){
		// 	PointsToGoal = 'Achieved!'
		// }; 
	
		// $('#PointsToGoal').text(' ' + PointsToGoal);
		var PointsToday = data['PointsToday'];
		$('#PointsToday').text(' ' + PointsToday);
		$('#EffortReserve').text(' ' + data['EffortReserve']);
		$('#Streak').text(' ' + data['Streak']);
	
	});
});


// $('.ShowDetailViewerButton').on('click', function(){
$(document).on('click', '.ShowDetailViewerButton', function(){

	var ksu = $(this).closest('#MissionKSU');
	
	var ScoreDetail = ksu.find('#ScoreDetail');
	ScoreDetail.toggleClass('hidden');

	var GlaphiconDiv = ksu.find('#PlusMinusGlyphicon');
	GlaphiconDiv.toggleClass('glyphicon-minus');
	GlaphiconDiv.toggleClass('glyphicon-plus');	
});

$(document).on('click', '.OtherShowDetailViewerButton', function(){

	var ksu = $(this).closest('#MissionKSU');
	
	var ScoreDetail = ksu.find('#ScoreDetail');
	ScoreDetail.toggleClass('hidden');

	var GlaphiconDiv = ksu.find('#PlusMinusGlyphicon');
	GlaphiconDiv.toggleClass('glyphicon-minus');
	GlaphiconDiv.toggleClass('glyphicon-plus');	
});



$(document).on('focusin', '.QuickAttributeUpdate', function(){
	
	var attr_value = $(this).val();
	if($(this).attr("type") == 'checkbox'){
		attr_value = $(this).is(':checked');
	}; 

	$(this).on('focusout', function(){
		if(attr_value != $(this).val()){
			var attr_key = $(this).attr("name");
			var attr_type = $(this).attr("type");
			attr_value = $(this).val();
			if( attr_type == 'checkbox'){
				attr_value = $(this).is(':checked');
			}; 

			var ksu = $(this).closest('#MissionKSU');
			var ksu_id = ksu.attr("value");
			var content_type = 'KSU';
			

			if (ksu.attr("KSUorEvent") == 'Event'){ 
				content_type = 'Event'
			};
			
			console.log(attr_type);
			console.log(attr_key);
			console.log(attr_value);

			$.ajax({
				type: "POST",
				url: "/EventHandler",
				dataType: 'json',
				data: JSON.stringify({
					'ksu_id': ksu_id,
					'content_type':content_type,
					'user_action': 'UpdateKsuAttribute',
					'attr_key':attr_key,
					'attr_value':attr_value,
				})
			})
			
			.done(function(data){
				console.log(data['updated_value']);

				if( attr_type == 'checkbox'){
					var description = ksu.find('#description');
					var secondary_description = ksu.find('#secondary_description');
					var is_critical = ksu.find('#is_critical').is(':checked');
					var is_active = ksu.find('#is_active').is(':checked');
					console.log(is_active, is_critical);
					if(is_critical && is_active){
						description.css('color', '#B22222');				
					} else if (is_active){
						description.css('color', 'black');				
					} else {
						description.css('color', '#b1adad');
					};

				};

				if (attr_key == 'description'){
					ksu.find('#description').val(data['updated_value'])};

				if(attr_key == 'next_event'){
					var TodayDate = new Date().toJSON().slice(0,10).replace(/-/g,'-');
					if(attr_value > TodayDate){
						ksu.animate({
							"opacity" : "0",},{
							"complete" : function(){
								ksu.remove();
							}
						})
						console.log('Evento en el futuro');
					}					
				};
			})
		};
	})
	
});


// Hace que sea posible desseleccionar radios    
var allRadios = document.getElementsByName('ksu_subtype');
var booRadio;
var x = 0;
for(x = 0; x < allRadios.length; x++){

    allRadios[x].onclick = function() {
        if(booRadio == this){
            this.checked = false;
            booRadio = null;
        }else{
            booRadio = this;
        }
    };
}



$(document).on('focusin.autoExpand', 'textarea.autoExpand', function(){
        var savedValue = this.value;
        this.value = '';
        this.rows = 1;
        this.baseScrollHeight = this.scrollHeight;
        
        this.rows = 2
        this.lineHeight = this.scrollHeight - this.baseScrollHeight

        this.rows = 1;
        this.value = savedValue;        
 
        rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / this.lineHeight); 
        this.rows = 1 + rows;

    })
    .on('input.autoExpand', 'textarea.autoExpand', function(){
        var minRows = 1 //this.getAttribute('data-min-rows')|0, rows;
        this.rows = minRows;
        rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / this.lineHeight); 
        this.rows = minRows + rows;
    });

var t;
var start_time;


function secondsToHms(segundos_timer, effort_denominator, starting_seconds) {

	d = segundos_timer + starting_seconds;	
	var h = Math.floor(d / 3600);
	var m = Math.floor(d % 3600 / 60);
	var s = Math.floor(d % 3600 % 60);

	// console.log('effort_denominator: ')
	// console.log(effort_denominator)

	var base_values = {'2':2, '3':1, '6':0};
	var base_value = base_values[String(effort_denominator)]

	effort_denominator = 60 * effort_denominator
	var new_kpts_value;
	
	// console.log(base_value)

	new_kpts_value = Math.floor(d  / effort_denominator) + base_value
	// new_kpts_value = Math.floor(d  / effort_denominator) + 1
	
	// console.log('new_kpts_value: ')
	// console.log(new_kpts_value)

	return [h, m, s, new_kpts_value]
}


function add(target_timer, effort_denominator, kpts_value, starting_seconds) {	
    
	var segundos_timer = Math.floor((parseFloat(new Date().valueOf()) - parseFloat(start_time.valueOf()))/1000) ;
	
	// var secondsToHms_output =  secondsToHms(segundos_timer, puntos_ya_agregados, effort_denominator, starting_seconds);
	var secondsToHms_output =  secondsToHms(segundos_timer, effort_denominator, starting_seconds)
	var hours = secondsToHms_output[0];
	var minutes = secondsToHms_output[1];
	var seconds = secondsToHms_output[2];
	// var puntos_por_agregar = secondsToHms_output[3];
	var new_kpts_value = secondsToHms_output[3];

    
    target_timer.text((hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds));
    // timer(target_timer, puntos_por_agregar + puntos_ya_agregados, effort_denominator, kpts_value, starting_seconds);

    if (new_kpts_value - kpts_value.val() > 0 ){	
    	kpts_value.val(new_kpts_value)

    }

    timer(target_timer, effort_denominator, kpts_value, starting_seconds);
    
    target_timer.attr("seconds", seconds);
    target_timer.attr("minutes", minutes);
    target_timer.attr("hours", hours);

    // if (puntos_por_agregar > 0 ){
    // 	kpts_value.val(parseInt(kpts_value.val())+puntos_por_agregar)
    // }
}


function timer(target_timer, effort_denominator, kpts_value, starting_seconds) {	
    t = setTimeout(function(){
    	add(target_timer, effort_denominator, kpts_value, starting_seconds)
    }, 1000);
}

$(document).on('click', '.PlayStopButton', function(){
	clearTimeout(t);
	var ksu = $(this).closest('#MissionKSU');
	var effort_denominator = parseInt(ksu.find('input:radio[name=effort_denominator]:checked').val());
	var puntos_ya_agregados = 0;
	var kpts_value = ksu.find('#kpts_value');

	if(kpts_value.val() == ''){
		kpts_value.val(1)};	

	var button_action = $(this).attr("button_action")
	var GlaphiconDiv = $(this).find('#PlayStopGlyphicon');
	var target_timer = ksu.find('#ksu_timer');
	var seconds = target_timer.attr("seconds"), minutes = target_timer.attr("minutes"), hours = target_timer.attr("hours");

	var starting_seconds =  parseInt(target_timer.attr("seconds")) + parseInt(target_timer.attr("minutes"))*60 + parseInt(target_timer.attr("hours"))*3600;

    
	if (button_action == 'Play'){
		start_time = new Date();
		$(this).attr("button_action", "Stop")

		if( target_timer.text() == '00:00:00' ){
			kpts_value.val(1)
		}
		
		timer(target_timer, effort_denominator, kpts_value, starting_seconds);
		// timer(target_timer, puntos_ya_agregados, effort_denominator, kpts_value, starting_seconds);				


	} else {
		$(this).attr("button_action", "Play");
		$.ajax({
			type: "POST",
			url: "/EventHandler",
			dataType: 'json',
			data: JSON.stringify({
				'ksu_id': ksu.attr("value"),
				'content_type':'KSU',
				'user_action':'TimerStop',
				// 'user_action': 'UpdateKsuAttribute',
				'kpts_value':ksu.find('#kpts_value').val(),
				'timer_value': target_timer.text(),
				'hours': hours,
				'minutes': minutes,
				'seconds': seconds
				// 'attr_key':'kpts_value',
				// 'attr_value':ksu.find('#kpts_value').val()
			})
		})
	}

	GlaphiconDiv.toggleClass('glyphicon-play');
	GlaphiconDiv.toggleClass('glyphicon-stop');	
});

// #xx
$('input[type=radio][name=effort_denominator]').on('change',function(){
	var ksu = $(this).closest('#MissionKSU');
	var effort_denominator = $(this).val()
	var segundos_timer = 0
	var target_timer = ksu.find('#ksu_timer');
	var starting_seconds =  parseInt(target_timer.attr("seconds")) + parseInt(target_timer.attr("minutes"))*60 + parseInt(target_timer.attr("hours"))*3600;
	var new_kpts_value = secondsToHms(segundos_timer, effort_denominator, starting_seconds)[3];
	$.ajax({
		type: "POST",
		url: "/EventHandler",
		dataType: 'json',
		data: JSON.stringify({
			'ksu_id': ksu.attr("value"),
			'content_type':'KSU',
			'user_action': 'UpdateKsuAttribute',
			'attr_key':'kpts_value',
			'attr_value':new_kpts_value,
			})
	}).done(function(data){
		var kpts_value = ksu.find('#kpts_value');
		kpts_value.val(new_kpts_value);
	})
}); 


$('input[type=radio][name=jg_size]').on('change',function(){
	var ksu = $(this).closest('#MissionKSU');
	var jg_size = $(this).val()
	
	$.ajax({
		type: "POST",
		url: "/EventHandler",
		dataType: 'json',
		data: JSON.stringify({
			'ksu_id': ksu.attr("value"),
			'content_type':'KSU',
			'user_action': 'UpdateKsuAttribute',
			'attr_key':'effort_denominator',
			'attr_value':jg_size,
			})
	}).done(function(data){
		var kpts_value = ksu.find('#kpts_value');
		kpts_value.val(jg_size);
	})
}); 



$(document).on('dragstart', '.KSUdisplaySection', function(){
// $( ".KSUdisplaySection" ).on("dragstart", function(){
	var ksu = $(this)
	var posicion_inicial = ksu.index() - 1;

	// console.log('Esta es la posicion inicial:')
	// console.log(posicion_inicial)
	
	$( ".KSUdisplaySection" ).on("dragend", function(){
	// ksu.on("dragend", function(){
		// console.log('Esta es la posicion final:')
		// console.log(ksu.index())
		var posicion_final = ksu.index();
		var valor_inferior = parseInt(ksu.next().find('#importance').val());
		var valor_superior = parseInt(ksu.prev().find('#importance').val());
		
		if (isNaN(valor_inferior)){
			valor_inferior = valor_superior - 100
		}

		if (isNaN(valor_superior)){
			valor_superior = valor_inferior + 100
		}		

		if (posicion_final != posicion_inicial){
			// console.log('Cambio de posicion!')			
			ksu.find('#importance').val(Math.round((valor_inferior+valor_superior)/2))
			// console.log('Importancia final:')
			// console.log(ksu.find('#importance').val())

			$.ajax({
				type: "POST",
				url: "/EventHandler",
				dataType: 'json',
				data: JSON.stringify({
					'ksu_id': ksu.attr("value"),
					'content_type':'KSU',
					'user_action': 'UpdateKsuAttribute',
					'attr_key':'importance',
					'attr_value':ksu.find('#importance').val(),
				})
			}).done(function(data){
				console.log(ksu.find('#description').val());
				console.log(data['updated_value'])})

		} else {
			// console.log(ksu.find('#description').val());
			console.log('No hubo cambio de posicion')
		} 

		$( ".KSUdisplaySection" ).off( "dragend");
		// ksu.removeClass('sortable-chosen')
		// ksu.removeAttr('draggable')
	});
});


function MakeSortable(){
	var SeccionesSorteables = document.getElementsByClassName('sortable');
	var ListasRequeridas = SeccionesSorteables.length;
	
	for (var i = 0; i < ListasRequeridas; i++) {
	   new Sortable(document.getElementsByClassName('sortable')[i], { group: "omega" });	    
	    // console.log('BOOM!');
	}
};


$(document).ready(function(){
	MakeSortable()
	// new Sortable(document.getElementsByClassName('sortable')[0]);
});





