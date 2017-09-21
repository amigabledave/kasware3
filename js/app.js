// Validated for KASware3

// ------- Triggers ----
var ksu_type_attributes, attributes_guide, reasons_guide, $zoom, t, start_time;

$(document).ready(function(){
	$.ajax({
		type: "POST",
		url: "/",
		dataType: 'json',
		data: JSON.stringify({
			'user_action': 'RetrieveTheory'
		})
	})
	.done(function(data){		
		// console.log('Asi se ve la teoria')
		// console.log(data)
		ksu_type_attributes = data['ksu_type_attributes']
		attributes_guide = data['attributes_guide']
		reasons_guide = data['reasons_guide']		
		// console.log(reasons_guide)	
		RenderReasonsIndex(data['reasons_index'])
		
		var ksu_set = data['ksu_set']
		for (var i = ksu_set.length - 1; i >= 0; i--) {
			render_ksu(ksu_set[i])
		}

		var history = data['history']
		for (var j = history.length - 1; j >= 0; j--) {
			render_event(history[j])
		}

		var game_logs = data['game_logs']
		for (var k = game_logs.length - 1; k >= 0; k--) {
			render_game_log(game_logs[k])
		}

		var game_log = data['game_log'];
		AdjustGame(game_log);

		var best_scores = data['best_scores'];

		$('#best_piggy_bank_eod').text(best_scores['best_piggy_bank_eod']);
		$('#best_ev_piggy_bank_eod').text(best_scores['best_ev_piggy_bank_eod']);

		FixTheoryView()		
	})

	$('#center_column').css({'height': $(window).height()})
	$('#SectionSelectionBar').css({'min-height': $(window).height()})
	
});

$(window).on('resize', function(){
	$('#center_column').css({'height': $(window).height()})
	$('#SectionSelectionBar').css({'min-height': $(window).height()})
})


$('.SectionButton').on('click', function(){
	var section = $(this).attr('value');
	$('.SelectedSection').removeClass('SelectedSection')
	$(this).addClass('SelectedSection').blur()
	
	 if(section != 'more'){
		$('#SectionTitle').text(section_details[section]['title']);
		FixTheoryView()
		window.scrollTo(0, 0);
	
	} else {
		$('#more_buttons').toggleClass('hidden')
		$('#ShowMoreSpan').toggleClass('hidden')
		$('#ShowLessSpan').toggleClass('hidden')
		
	}

	ShowOptionsBasedOnView(section)
});


$('#CreateNewKSU').on('click',function(){
	var selected_section = $('.SelectedSection').first().attr('value');
	var ksu_type = section_details[selected_section]['new_ksu_type'];
	var new_ksu = $('#KSUTemplate').clone();
	
	new_ksu = FixTemplateBasedOnKsuType(new_ksu, ksu_type)
	new_ksu.attr('id', 'KSU');
	new_ksu.attr('ksu_type', ksu_type)
	new_ksu.find('#ksu_type').attr('value', ksu_type);
	
	new_ksu.find('#glyphicon').addClass(ksu_type_glyphicons[ksu_type])
	new_ksu.find('#ShowDetailButton').addClass('hidden');
	new_ksu.find('#SaveNewKSUButton').removeClass('hidden');
	
	new_ksu = add_reason_select_to_ksu(new_ksu, false);
	new_ksu.prependTo('#TheoryHolder');
	// console.log($('#ksu_subtype').val())
	new_ksu = FixTemplateBasedOnKsuSubtype(new_ksu, $('#ksu_subtype').val());
	new_ksu.removeClass('hidden');
	new_ksu.show()
	new_ksu.find('#description').focus();
	ShowDetail(new_ksu);

	if(selected_section == 'mission'){
		var TodayDate = new Date().toJSON().slice(0,10).replace(/-/g,'-');
		set_ksu_attr_value(new_ksu, 'event_date', TodayDate)
	}
});


$(document).on('click', '.KsuActionButton', function(){
	var ksu = $(this).closest('#KSU');
	var action = $(this).attr('value');
	// console.log(action)
	
	$(this).prop("disabled",true);	
	var actions_menu = {
		'ShowKsuDetail': ShowKsuDetail,
		'SaveNewKSU': SaveNewKSU,
		'DeleteKSU': DeleteKSU,
		'AddEventComments': AddEventComments,
		'Action_Done': ActionDone,
		'Stupidity_Commited': StupidityCommited,
		'Action_Skipped': UpdateEventDate,
		'Action_Pushed': UpdateEventDate,
		'SendToMission': UpdateEventDate,

		'Milestone_Reached': MilestoneReached,
		'EndValue_Experienced': EndValueExperienced,
		'Measurement_Recorded': MeasurementRecorded,

		'ToggleJoyGenerator':ToggleKSUJoyGenerator,
	}

	actions_menu[action](ksu);
	$(this).prop("disabled",false);

	function SaveNewKSU(ksu){
		ksu.attr("value","")
		var attributes_dic = {};
		var ksu_attributes = ksu.find('.KsuAttr');
		
		for (var i = ksu_attributes.length - 1; i >= 0; i--) {
			var KsuAttr = $(ksu_attributes[i]);
			attributes_dic[KsuAttr.attr("name")] = get_ksu_attr_value(ksu, KsuAttr.attr("name"))
		} 
		
		attributes_dic['user_action'] = 'SaveNewKSU';
		attributes_dic['reason_id'] = $('#reason_holder').attr('reason_id');
		console.log(attributes_dic);

		$.ajax({
			type: "POST",
			url: "/",
			dataType: 'json',
			data: JSON.stringify(attributes_dic)
		}).done(function(data){
			// console.log(data); 
			ksu.attr("value",data['ksu_id']);
			
			ksu.find('#ShowDetailButton').removeClass('hidden');
			ksu.find('#SaveNewKSUButton').addClass('hidden');
			ShowDetail(ksu);
			AddReasonToSelect(data['ksu_id'], get_ksu_attr_value(ksu, 'ksu_subtype'), ksu.find('#description').val());

			if(ksu.hasClass('PictureOnStandBy')){
				AddKsu_idToPicInput(ksu);
				ksu.removeClass('PictureOnStandBy');
				ksu.find('#SavePic').trigger('click');
			}	
		});	
	};

	function DeleteKSU(ksu){
		if(ksu.attr("value")==""){
			ksu.remove()
		} else {
			$.ajax({
				type: "POST",
				url: "/KASware3",
				dataType: 'json',
				data: JSON.stringify({
					'user_action': 'DeleteKSU',
					'ksu_id': ksu.attr('value')
				})
			}).done(function(data){
				console.log(data);
				ksu.fadeOut("slow", function(){
					$(this).remove()
				})
				
				$("[reason_id='"+ data['ksu_id'] +"']").attr('reason_id', '')
				$("[value='"+ data['ksu_id'] +"']").remove()
			});
		}		
	};

	function AddEventComments(ksu){
		ksu.find('#event_comments_col').toggleClass('hidden');
		return
	};

	function ShowKsuDetail(ksu){
		ShowDetail(ksu);
		return
	};

	function UpdateEventDate(ksu){
		console.log('Update event date...')
		$.ajax({
			type: "POST",
			url: "/",
			dataType: 'json',
			data: JSON.stringify({
				'ksu_id': ksu.attr("value"),
				'user_action': action

			})
		}).done(function(data){			
			console.log(data); 
			set_ksu_attr_value(ksu, 'event_date', data['new_event_date'])
			var selected_section = $('.SelectedSection').first().attr('value');
			
			if(selected_section == 'mission' && inList(action, ['Action_Skipped','Action_Pushed'])){
				ksu.hide()				
			}

			ShowDetail(ksu);	
		});			
	};

	function ActionDone(ksu){
		console.log('Action Done...')
		
		var ksu_subtype = get_ksu_attr_value(ksu, 'ksu_subtype');
		var score =	ksu.find('#'+ ksu_subtype +'_Merits').text();
		ksu.fadeOut('slow');
		$.ajax({
			type: "POST",
			url: "/",
			dataType: 'json',
			data: JSON.stringify({
				'ksu_id': ksu.attr("value"),
				'user_action': action,
				'score': score,
				'size': get_ksu_attr_value(ksu, 'size'),
				'counter': get_ksu_attr_value(ksu, 'counter'),
			})
		}).done(function(data){
			console.log(data); 
			
			if(!data['in_graveyard']){
				ksu.fadeIn('slow')
			} else {
				ksu.remove()
			}

			AdjustGame(data['game_log'])			
			render_event(data['event_dic'])

		});
	};

	function StupidityCommited(ksu){
		console.log('Stupidity Commited...')
		var score =	ksu.find('#Negative_Merits').text();
		ksu.fadeOut('slow');
		$.ajax({
			type: "POST",
			url: "/",
			dataType: 'json',
			data: JSON.stringify({
				'ksu_id': ksu.attr("value"),
				'user_action': action,
				'score': score,
				'size': get_ksu_attr_value(ksu, 'size'),
				'counter': get_ksu_attr_value(ksu, 'counter'),
			})
		}).done(function(data){
			console.log(data); 
			ksu.fadeIn('slow')
			AdjustGame(data['game_log'])			
			render_event(data['event_dic'])

		});
	};

	function MilestoneReached(ksu){
		console.log('Milestone Reached...')
		ksu.fadeOut('slow');
		$.ajax({
			type: "POST",
			url: "/",
			dataType: 'json',
			data: JSON.stringify({
				'ksu_id': ksu.attr("value"),
				'user_action': action,
			})
		}).done(function(data){
			console.log(data); 		
			ksu.remove()
			render_event(data['event_dic'])
		});
	};

	function EndValueExperienced(ksu){
		console.log('End value experienced...')
						
		ksu.fadeOut('slow');
		$.ajax({
			type: "POST",
			url: "/",
			dataType: 'json',
			data: JSON.stringify({
				'ksu_id': ksu.attr("value"),
				'user_action': action,
				'score': ksu.find('#EndValueMerits').text(),
				'size': 0,
				'counter': get_ksu_attr_value(ksu, 'counter'),
			})
		}).done(function(data){
			console.log(data); 
			
			if(!data['in_graveyard']){
				ksu.fadeIn('slow')
			} else {
				ksu.remove()
			}

			AdjustGame(data['game_log'])
			render_event(data['event_dic'])

		});
	};

	function MeasurementRecorded(ksu){
		console.log('Measurement recorded...')
		
		var score;
		var ksu_subtype = get_ksu_attr_value(ksu, 'ksu_subtype');

		if(ksu_subtype == 'Perception'){
			score = ksu.find('input:radio[name=PerceptionSnapshot]:checked').val();
		} else {
			score = ksu.find('#RealitySnapshot').val()
		}
		
		console.log(score);	
		ksu.fadeOut('slow');
		$.ajax({
			type: "POST",
			url: "/",
			dataType: 'json',
			data: JSON.stringify({
				'ksu_id': ksu.attr("value"),
				'user_action': action,
				'score': Math.floor(score),
			})
		}).done(function(data){
			console.log(data); 
			render_event(data['event_dic'])
		});
		ShowDetail(ksu)
		ksu.fadeIn('slow')
	};

	function ToggleKSUJoyGenerator(ksu){
		var size = get_ksu_attr_value(ksu, 'size');		
		if(size != 0){
			set_ksu_attr_value(ksu, 'size', 0)
		} else {	
			set_ksu_attr_value(ksu, 'size', 2)}
		size = get_ksu_attr_value(ksu, 'size');
		if (ksu.attr("value") != ''){UpdateKsuAttribute(ksu.attr("value"), 'size', size)};
		ToggleJoyGenerator(ksu)
		UpdateMerits(ksu)
	};
});


$(document).on('click', '.UserActionButton', function(){
	var ksu = $(this).closest('#KSU');
	var action = $(this).attr('value');
	// console.log(action)
	
		
	var actions_menu = {
		'Activate50SlackCut': ActivateSlackCut,
		'Activate100SlackCut': ActivateSlackCut,
	}

	actions_menu[action]();
	

	function ActivateSlackCut(){
		console.log('Slack Cutter Activated...')
		$(this).prop("disabled",true);
		$.ajax({
			type: "POST",
			url: "/",
			dataType: 'json',
			data: JSON.stringify({				
				'user_action': action,								
			})
		}).done(function(data){
			console.log(data); 			
			AdjustGame(data['game_log'])			
		});
	}	
});


function AdjustGame(game_log){

	$('#merits_earned').text(' ' + game_log['merits_earned']);
	$('#piggy_bank').text(' ' + game_log['piggy_bank']);
	$('#streak_day').text(' ' + game_log['streak_day']);

	$('#piggy_bank_sod').text(game_log['piggy_bank_sod']);
	$('#ev_piggy_bank_sod').text(game_log['ev_piggy_bank_sod']);
	
	$('#available_50_slack_cut').text(game_log['available_50_slack_cut']);
	$('#merits_till_next_50_slack_cut').text(game_log['merits_till_next_50_slack_cut']);

	$('#available_100_slack_cut').text(game_log['available_100_slack_cut']);
	$('#merits_till_next_100_slack_cut').text(game_log['merits_till_next_100_slack_cut']);

	$('#Activate50SlackCut').prop("disabled", game_log['disable_50_slack_cut'])
	$('#Activate100SlackCut').prop("disabled", game_log['disable_100_slack_cut']) 
};


$(document).on('click', '.EventActionButton', function(){
	var event = $(this).closest('#Event');
	var action = $(this).attr('value');

	$(this).prop("disabled",true);	
	var actions_menu = {
		'DeleteEvent': DeleteEvent,
	}
	actions_menu[action](event);
	$(this).prop("disabled",false);


	function DeleteEvent(event){
		console.log('Deleting event...')
		$.ajax({
			type: "POST",
			url: "/KASware3",
			dataType: 'json',
			data: JSON.stringify({
				'user_action': 'DeleteEvent',
				'event_id': event.attr('value')
			})
		}).done(function(data){
			console.log(data);
			event.fadeOut("slow", function(){
				$(this).remove()
			})
			
			AdjustGame(data['game_log'])
			if(data['render_ksu']){
				render_ksu(data['ksu'])	
			}
		});
	};
});


$(document).on('change', '.ScoreInput', function(){
	var ksu = $(this).closest('#KSU');
	UpdateMerits(ksu);
});


$(document).on('click', '.SavePicure', function(){
	console.log('Si se dio cuenta de que quiero gurdar la foto')
	var ksu = $(this).closest('#KSU');
	ksu.find('#SavePic').addClass('hidden');
	
	$.ajax({
		type: "POST",
		url: "/",
		dataType: 'json',
		data: JSON.stringify({'user_action': 'RequestNewPicInputAction'})
	}).done(function(data){

		$('#new_pic_input_action').attr('action', data['new_pic_input_action']);
		console.log(data['mensaje'])
	});
});


$(document).on('click', '.TimeBarButton',function(){
	var ksu = $(this).closest('#KSU');
	var TimeRuler = ksu.find('#TimeRuler');

	if(TimeRuler.is(":visible")){
		TimeRuler.addClass('hidden');
		ksu.find('.KSUdisplaySection').addClass('TopRoundBorders');

	} else {
		TimeRuler.removeClass('hidden');
		ksu.find('.KSUdisplaySection').removeClass('TopRoundBorders');
	}
})


$(document).on('click', '.PlayStopButton', function(){
	clearTimeout(t);
	
	var ksu = $(this).closest('#KSU');
	
	var button_action = $(this).attr("button_action")
	var GlaphiconDiv = $(this).find('#PlayStopGlyphicon');
	var target_timer = ksu.find('#counter');
	
	var starting_minutes =  parseInt(target_timer.val());
    
	var target_button_id = '#EffortDoneButton'
	if(get_ksu_attr_value(ksu, 'size') == 0){
		target_button_id = '#EndValueExperiencedButton'
	}


	if (button_action == 'Play'){
		
		ksu.find(target_button_id).addClass('PlayPulse');
		ksu.find(target_button_id).prop("disabled", true);

		start_time = new Date();
		$(this).attr("button_action", "Stop")
		
		timer(target_timer, starting_minutes);
						
	} else {

		ksu.find(target_button_id).removeClass('PlayPulse');
		ksu.find(target_button_id).prop("disabled", false);
		$(this).attr("button_action", "Play");
		UpdateKsuAttribute(ksu.attr('value'), 'counter', target_timer.val())
	}

	GlaphiconDiv.toggleClass('glyphicon-play');
	GlaphiconDiv.toggleClass('glyphicon-stop');	
});


function add(target_timer, starting_minutes) {	
    
	var minutes_passed = Math.floor((parseFloat(new Date().valueOf()) - parseFloat(start_time.valueOf()))/(1000*60)); //
	// console.log('Minutes passed: ' + minutes_passed)
	var minutes_timer = target_timer.val()
	var total_minutes = starting_minutes + minutes_passed		
    // console.log('Munutes Timer: ' + minutes_timer)
    // console.log('Total Minutes:' + total_minutes)
    // console.log('-----------------------------')
    if (total_minutes > minutes_timer){
    	var ksu = target_timer.closest('#KSU');
    	UpdateMerits(ksu)
		target_timer.val(total_minutes)    
    	if(total_minutes % 5 == 0){
    		UpdateKsuAttribute(ksu.attr('value'), 'timer', total_minutes)
    	}
    }

    timer(target_timer, starting_minutes);
}


function timer(target_timer, starting_minutes) {	
    t = setTimeout(function(){
    	add(target_timer, starting_minutes)
    }, 10000);//Para que cheque cada 10 segundos en lugar de cada segundo
}


$(document).on('focusin', '.KsuAttr', function(){
	
	var ksu = $(this).closest('#KSU');
	if (ksu.attr("value") == ''){return};

	// var KsuAttr = $(this)
	var initial_attr_value = get_ksu_attr_value(ksu, $(this).attr("name"));
	// console.log('Se reconocio que se esta acutalizando un attributo')
	// console.log(initial_attr_value)
	$(this).on('focusout', function(){
		
		var attr_value = get_ksu_attr_value(ksu, $(this).attr("name"));
		
		if(initial_attr_value != attr_value){
			// console.log('Se reconocio que el attributo cambio')
			var ksu_id = ksu.attr("value");
			var attr_key = $(this).attr("name");
			
			UpdateKsuAttribute(ksu_id, attr_key, attr_value)
		};
		$(this).off()
	})
});


$(document).on('focusin', '.TheoryAttr', function(){
	
	var theory = $(this).closest('#Theory');
	if (theory.attr("value") == ''){return};

	var initial_attr_value = get_ksu_attr_value(theory, $(this).attr("name"));
	console.log('Se reconocio que se esta acutalizando un attributo')
	console.log(initial_attr_value)
	$(this).on('focusout', function(){
		
		var attr_value = get_ksu_attr_value(theory, $(this).attr("name"));
		
		if(initial_attr_value != attr_value){
			// console.log('Se reconocio que el attributo cambio')
			var theory_id = theory.attr("value");
			var attr_key = $(this).attr("name");						
			$.ajax({
				type: "POST",
				url: "/",
				dataType: 'json',
				data: JSON.stringify({
					'theory_id': theory_id,					
					'user_action': 'UpdateTheoryAttribute',
					'attr_key':attr_key,
					'attr_value':attr_value,
				})
			})
			.done(function(data){console.log(data);})
		};
		$(this).off()
	})
});


$(document).on('change', '#money_cost', function(){
	var ksu = $(this).closest('#KSU');
	HideShowCostFrequency(ksu)	
})


$(document).on('change', '.SubtypeSelect', function(){
	var ksu = $(this).closest('#KSU');
	var ksu_subtype =  ksu.find('#ksu_subtype').val()
	FixTemplateBasedOnKsuSubtype(ksu, ksu_subtype)
	
	if(ksu.attr('ksu_type') == 'Action'){
		
		UpdateMerits(ksu)
		if( ksu_subtype == 'Reactive' || ksu_subtype == 'Negative'){
			set_ksu_attr_value(ksu, 'repeats', 'Always')
		}
	}

	remove_reason_select_from_ksu(ksu)
	var reason_id = ksu.find('#reason_holder').attr('reason_id')
	add_reason_select_to_ksu(ksu, reason_id );
});


$(document).on('change', '.ReasonSelect', function(){
	
	var ksu = $(this).closest('#KSU');
	var attr_value = get_ksu_attr_value(ksu, $(this).attr("name"));
	var old_value = ksu.find('#reason_holder').attr('reason_id');
	
	if (attr_value == old_value){return};
	ksu.find('#reason_holder').attr('reason_id', attr_value)
	// if (ksu.attr("value") == ''){return};
	
	var ksu_id = ksu.attr("value");
	HideShowLinkType(ksu)
	
	if (ksu.attr("value") != ''){UpdateKsuAttribute(ksu_id, 'reason_id', attr_value)};
});


$(document).on('change', '.StatusSelect', function(){
	var ksu = $(this).closest('#KSU');
	FormatBasedOnStatus(ksu, $(this).val())
});


$(document).on('change','.ShowHideSelect', function(){
  
  var ksu = $(this).closest('#KSU');
  var select = $(this).attr('name');
  var option = $(this).val();
  
  ShowHideSelect(ksu, select, option);
});


$(document).on('change', '.MonitorCheckbox', function(){
	var ksu_subtype = get_ksu_attr_value($(this).closest('#KSU'), 'ksu_subtype');
	if(ksu_subtype != 'Reactive'){
		$(this).closest('#KSU').find('#MonitorDetails').toggleClass('hidden')
	}	
});


$(document).on('change', '.IsCriticalCheckbox', function(){
	
	var ksu = $(this).closest('#KSU');	
	var new_status = 'Active'
	var is_critical = ksu.find('#is_critical').prop("checked");

	if(is_critical){
		new_status = 'Critical'
	}

	set_ksu_attr_value(ksu, 'status', new_status)
	if (ksu.attr("value") != ''){UpdateKsuAttribute(ksu.attr("value"), 'status', new_status)};
	FormatBasedOnStatus(ksu, new_status)
});



$(document).on('change', '.pic_input', function(){
    var ksu = $(this).closest('#KSU');    
    readURL(ksu, this);
    AddKsu_idToPicInput(ksu);
    ksu.find('#ksu_pic').magnify();
    
    if(ksu.attr('value') != ''){
    	ksu.find('#SavePic').removeClass('hidden');
    } else {
    	ksu.addClass('PictureOnStandBy')
    } 
});


function get_ksu_attr_value(ksu, attr_key){
	// console.log(attr_key)
	var KsuAttr = ksu.find('#' + attr_key)
	var attr_type = attributes_guide[attr_key][1];
	// console.log(attr_type)
	if (attr_type == 'Standard' || attr_type == 'Select'){
		return KsuAttr.val();

	} else if (attr_type == 'Radio'){
		return ksu.find('input:radio[name=' + attr_key + ']:checked').val();
	
	} else if (attr_type == 'Checkbox'){
		return KsuAttr.is(':checked');
	}
}


function inList(target_element, list){
	return list.indexOf(target_element) >= 0
}


function render_ksu(ksu_dic){
	var ksu = $('#KSUTemplate').clone();
	ksu = FixTemplateBasedOnKsuType(ksu, ksu_dic['ksu_type']);
	ksu = FixTemplateBasedOnKsuSubtype(ksu, ksu_dic['ksu_subtype']);
	ksu.attr("id", 'KSU');
	ksu.attr('ksu_type', ksu_dic['ksu_type']);
	ksu.attr("value", ksu_dic['ksu_id']);
	
	// console.log(ksu_dic);
	var ksu_type = ksu_dic['ksu_type'];
	var attributes = ksu_type_attributes['Base'].concat(ksu_type_attributes[ksu_type]);	
	if (['Experience', 'Contribution', 'SelfAttribute', 'Person', 'Possesion', 'Environment'].indexOf(ksu_type) >= 0){		
		attributes = attributes.concat(ksu_type_attributes['LifePiece'])		
	}
	
	for (var i = attributes.length - 1; i >= 0; i--) {
		
		var attribute = attributes[i];		
		var attr_type = attributes_guide[attribute][1];
		var attr_value = ksu_dic[attribute]

		set_ksu_attr_value(ksu, attribute, attr_value)
	}

	ksu.find('#reason_holder').attr('reason_id', ksu_dic['reason_id'])

	ksu.prependTo('#TheoryHolder');
	ksu.removeClass('hidden');

	if('best_time' in ksu_dic && ksu_dic['best_time'] != ''){
		ksu.find('#TimeRuler').removeClass('hidden');
		ksu.find('.KSUdisplaySection').removeClass('TopRoundBorders');
	}
	
	if(ksu_dic['pic_url']){
		SetKsuImage(ksu, ksu_dic['pic_url'])
	} else {
		ksu.find('#glyphicon').addClass(ksu_type_glyphicons[ksu_dic['ksu_type']])
	}

	if (attributes.indexOf('money_cost') >= 0){		
		HideShowCostFrequency(ksu);	
	}

	if (ksu_type == 'Action'){
		UpdateMerits(ksu)
		ToggleJoyGenerator(ksu)
		ksu.find('#is_critical').prop("checked", ksu_dic['status'] == 'Critical');
	}

	if(ksu_dic['monitor'] && ksu_dic['ksu_subtype'] != 'Reactive'){
		ksu.find('#MonitorDetails').removeClass('hidden')
	}

	if(inList(ksu_dic['ksu_subtype'], ['Reactive', 'Perception', 'Reality'])){
		ksu.find('#description').attr('rows',1);
	}

	FormatBasedOnStatus(ksu, ksu_dic['status'])

	AdjustTextAreaHeight(ksu.find('#description'))
}


function render_event(event_dic){
	var event = $('#EventTemplate').clone();
	var event_type = event_dic['event_type'];
	var score = event_dic['score'];

	var type_details = {
		'Effort': {'type_description': 'Effort Made', 'score_format': 'ScoreHolderEffort'},
		'Stupidity': {'type_description': 'Stupidity Commited', 'score_format': 'ScoreHolderStupidity'},

		'Progress': {'type_description': 'Milestone Reached', 'score_format': ''},
		'EndValue': {'type_description': 'Joy Generated', 'score_format': 'ScoreHolderEndValue'},
		
		'PursuitStarted': {'type_description': 'Pursuit Started', 'score_format': ''},
		'WishRealized': {'type_description': 'Wish Realized', 'score_format': 'IsRealized'},
		'LifePieceGone': {'type_description': 'Life Piece Gone', 'score_format': 'IsHistory'},

		'PerceptionSnapshot': {'type_description': 'Indicator Measurement', 'score_format': 'ScoreHolderPerception'},
		'RealitySnapshot': {'type_description': 'Indicator Measurement', 'score_format': 'ScoreHolderReality'},
	}

	if(event_type == 'PerceptionSnapshot'){
		score = {0:'No', 1:'Yes'}[score]
	}

	event.attr("id", 'Event');
	event.attr('event_type', event_type);
	event.attr("value", event_dic['event_id']);
	
	event.find('#ScoreHolder').addClass(type_details[event_type]['score_format'])
	event.find('#event_type').text(type_details[event_type]['type_description'])

	event.find('#event_score').text(score)
	event.find('#description').text(event_dic['description'])	
	event.find('#event_date').text(event_dic['event_date'])

	event.prependTo('#HistoryHolder');
	event.removeClass('hidden');
}


function render_game_log(game_log_dic){
	var game_log = $('#GameLogTemplate').clone();

	game_log.attr("id", 'GameLog');	
	game_log.attr("value", game_log_dic['game_log_id']);

	game_log.find('#streak_day').text(game_log_dic['streak_day']);
	game_log.find('#user_date').text(game_log_dic['user_date']);
	game_log.find('#attempt').text(game_log_dic['attempt']);
	game_log.find('#merits_goal').text(game_log_dic['merits_goal']);
	game_log.find('#slack_cut').text(game_log_dic['slack_cut']);
	game_log.find('#merits_earned').text(game_log_dic['merits_earned']);
	game_log.find('#merits_loss').text(game_log_dic['merits_loss']);
	game_log.find('#piggy_bank_eod').text(game_log_dic['piggy_bank_eod']);

	game_log.prependTo('#StreakHolder');
	game_log.removeClass('hidden');
}


function HideShowCostFrequency(ksu){
	var money_cost = get_ksu_attr_value(ksu, 'money_cost');	
	if(money_cost > 0){
		ksu.find('#cost_frequency_col').removeClass('hidden')
	} else {
		ksu.find('#cost_frequency_col').addClass('hidden')
	}
}

function HideShowLinkType(ksu){
	
	var reason_id = ksu.find('#reason_holder').attr('reason_id')
	if(reason_id != ''){
		ksu.find('#link_type_col').removeClass('hidden')
	} else {
		ksu.find('#link_type_col').addClass('hidden')
	}
}



function AddKsu_idToPicInput(ksu){
	var new_pic_input_action = $('#new_pic_input_action').attr('action');
	var pic_form = ksu.find('#pic_form');
	var new_action = new_pic_input_action.concat('?ksu_id='.concat(ksu.attr('value')))	
	pic_form.attr('action', new_action)
	return
}


function UpdateMerits(ksu){
	var merits = 0
	var ksu_subtype = get_ksu_attr_value(ksu, 'ksu_subtype'); 
	
	var size = ksu.find('input:radio[name=size]:checked').val();

	var timer = 0;
	var repetitions = 1;

	if ( ksu_subtype == 'Proactive'){
		timer = ksu.find('#counter').val();
	}
	
	if ( ksu_subtype != 'Proactive' && ksu.find('#counter').val() < 1){
		ksu.find('#counter').val(1);
	}

	if ( ksu_subtype != 'Proactive'){
		repetitions = ksu.find('#counter').val();
	}

	var timer_factor = {0:2, 1:10, 2:20, 3:40};

	var base = {
		'Proactive': {0:1, 1:1, 2:1, 3:5},
		'Reactive': {1:1, 2:3, 3:5},
		'Negative': {1:5, 2:10, 3:20},
	};

	merits = Math.max(Math.floor(timer_factor[size]*timer/60), base[ksu_subtype][size]*repetitions)

	ksu.find('#' + ksu_subtype + '_Merits').text(merits)

	ksu.find('#' + 'Negative' + '_Merits').text(base['Negative'][ksu.find('input:radio[name=negative_size]:checked').val()]*repetitions)

	if(size == 0){
		ksu.find('#EndValueMerits').text(merits)
	}
}


function SetKsuImage(ksu, pic_url){
	ksu.find('#ksu_pic').attr('src', pic_url);
	ksu.find('#ksu_pic').attr('data-magnify-src', pic_url);
	ksu.find('#img_holder').addClass('hidden');
	ksu.find('#ksu_pic').removeClass('hidden');
	ksu.find('#ksu_pic').magnify();  
};


function set_ksu_attr_value(ksu, attribute, attr_value){
	// console.log(attr_value)
	var attr_type = attributes_guide[attribute][1];
	
	if (attr_type == 'Standard'){
		ksu.find('#'+attribute).val(attr_value)
	
	} else if (attr_type == 'Select' && attribute != 'reason_id'){			
		ksu.find('#' + attribute).val(attr_value).prop('selected', true);
		if(ksu.find('#' + attribute).hasClass('ShowHideSelect')){
			ShowHideSelect(ksu, attribute, attr_value);	
		}
	
	} else if (attr_type == 'Radio'){
		ksu.find('input:radio[name=' + attribute + '][value='+ attr_value +']').prop("checked",true);
	
	} else if (attr_type == 'Checkbox'){
		ksu.find('#' + attribute).prop("checked", attr_value);
	}
}


function ShowDetail(ksu){
	
	var GlaphiconDiv = ksu.find('#PlusMinusGlyphicon');
	GlaphiconDiv.toggleClass('glyphicon-minus');
	GlaphiconDiv.toggleClass('glyphicon-plus');	
	
	var DetailDiv = ksu.find('#DetailDiv');
	DetailDiv.toggleClass('hidden');

	var best_time = ksu.find('#best_time').val()

	if(ksu.find('#DetailDiv').is(":visible")){
		var reason_id = ksu.find('#reason_holder').attr('reason_id')
		// console.log(reason_id)
		add_reason_select_to_ksu(ksu, reason_id );
	} else {
		remove_reason_select_from_ksu(ksu)
	}
};


function ToggleJoyGenerator(ksu){
	if(get_ksu_attr_value(ksu, 'ksu_subtype') == 'Reactive'){return}
	
	var size = get_ksu_attr_value(ksu, 'size');
	if(size == 0){		
		ksu.find('#ProactiveSizeRow').addClass('hidden')
		ksu.find('#EffortDoneButton').addClass('hidden')
		ksu.find('#EndValueExperiencedButton').removeClass('hidden')
		ksu.find('#KSUdisplaySection').addClass('IsRealized')
		ksu.find('#subtype_col').addClass('hidden')		
	
	} else {
		ksu.find('#subtype_col').removeClass('hidden')
		ksu.find('#ProactiveSizeRow').removeClass('hidden')
		ksu.find('#EffortDoneButton').removeClass('hidden')
		ksu.find('#EndValueExperiencedButton').addClass('hidden')
		ksu.find('#KSUdisplaySection').removeClass('IsRealized')
	}
};


function HideUnhideKsuProperties(ksu, targets, action){
	
	if (action == 'Hide'){
		for( t in targets){
			ksu.find(targets[t]).addClass('hidden') 
		}
	}
	
	if (action == 'Show'){
		for( t in targets){
			ksu.find(targets[t]).removeClass('hidden') 
		}		
	}
};


function ShowHideSelect(ksu, select, option){
	var select_toBeHidden = {
		'repeats': ['#repeats_Xdays_col', '#repeats_day_col', '#repeats_month_col', '#repeats_week_col'],
		'status': ['#memory_level_col', '#feasibility_col'],
	}


	var select_toBeShown = {
		'repeats':{
			'Never':[],
			'Always':[],
			'X_Days':['#repeats_Xdays_col'],
			'Week':['#repeats_week_col'],
			'Month':['#repeats_day_col'],
			'Year':['#repeats_day_col', '#repeats_month_col']
		},

		'status':{
			'Memory':['#memory_level_col'],
			'Wish':['#feasibility_col'],
		},
	}

	HideUnhideKsuProperties(ksu, select_toBeHidden[select], 'Hide');

	if(option in select_toBeShown[select]){
		HideUnhideKsuProperties(ksu, select_toBeShown[select][option], 'Show');
	}	
};


function RenderReasonsIndex(reasons_list){
	for (var i = reasons_list.length - 1; i >= 0; i--) {
		var reason = reasons_list[i]
		AddReasonToSelect(reason[0], reason[1], reason[2])
	}
};


function ReduceReasonsOptions(reasons_select, ksu_subtype){
	var reason_options = reasons_select.find('option');
	var valid_targets = reasons_guide[ksu_subtype]
	// console.log(valid_targets)
	for (var i = reason_options.length - 1; i > 0; i--){
		var option = $(reason_options[i]);
		var option_subtype = option.attr('ksu_subtype');
		
		if(inList(option_subtype, valid_targets) == false){
			option.addClass('InvalidOption')
		}
	}

	reasons_select.find('.InvalidOption').remove()
};


function AddReasonToSelect(ksu_id, ksu_subtype, description){
	$('#reasons_select').append($('<option>', {value:ksu_id, text:description, ksu_subtype:ksu_subtype}));
};


function add_reason_select_to_ksu(ksu, reason_id){
	// var selected_option = ksu.find('#reason').val()
	ksu.find('#reason_holder').empty()
	var reasons_select = $('#reasons_select_group').clone();
	ReduceReasonsOptions(reasons_select, get_ksu_attr_value(ksu, 'ksu_subtype'))
	// console.log(reasons_select)
	ksu.find('#reason_holder').append(reasons_select);
	ksu.find('#reasons_select_group').removeClass('hidden');
	ksu.find('#reasons_select').attr('id', 'reason_id')
	var $select = ksu.find('#reason_id').selectize();
	if(reason_id){
		var selectize = $select[0].selectize
		// selectize.setValue(selected_option, false);
		selectize.setValue(reason_id, false);
	}
	ksu.find('.selectize-dropdown').removeClass('SexySelect');
	HideShowLinkType(ksu)
	return ksu
}


function remove_reason_select_from_ksu(ksu){	
	ksu.find('#reason_holder').empty()
}


function ShowOptionsBasedOnView(target_view){
	var side_options = $('.SideOption');
	for (var i = side_options.length - 1; i >= 0; i--) {
		var option = $(side_options[i]);
		option.addClass('hidden')
		if( option.attr('target_view').includes(target_view)){
			option.removeClass('hidden')
		}
	}
}


function FixTemplateBasedOnKsuType(template, ksu_type){
	
	var type_spefic_sections = template.find('.TypeSpecific')
	for (var i = type_spefic_sections.length - 1; i >= 0; i--) {
		var section = $(type_spefic_sections[i]);
		if( !section.attr('target_type').includes(ksu_type)){
			section.remove()	
		}
	} 
	
	if (ksu_type == 'Action'){		
		template.find('#KSUdisplaySection').addClass('ActionBorders');
		template.find('#ShowDetailButton').addClass('ksu-circle-btn');
		template.find('#DescriptionHolder').addClass('col-xs-9');
	} else {
		template.find('#KSUdisplaySection').addClass('LifePieceBorder');
		template.find('#ShowDetailButton').addClass('LifePiceShowDetailBtn');
		template.find('#DescriptionHolder').addClass('col-xs-10');
	}

	var attrs_to_be_fixed = ksu_type_attr_details[ksu_type]

	for (var i = attrs_to_be_fixed.length - 1; i >= 0; i--) {
		var target_attr = attrs_to_be_fixed[i]
		fixTemplateDivAttr(template, target_attr[0], target_attr[1], target_attr[2])
	}

	return template
}


function FixTemplateBasedOnKsuSubtype(template, ksu_subtype){
	var subtype_spefic_sections = template.find('.SubtypeSpecific')
	for (var i = subtype_spefic_sections.length - 1; i >= 0; i--) {
		var section = $(subtype_spefic_sections[i]);
		if (section.attr('avoid_subtype').includes(ksu_subtype)){
			section.addClass('hidden')	
		} else {
			section.removeClass('hidden')
		}
	}
	

	return template 
}


function readURL(ksu, input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            ksu.find('#ksu_pic').attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
        ksu.find('#img_holder').addClass('hidden');
        ksu.find('#ksu_pic').removeClass('hidden');        
    }
}


function fixTemplateDivAttr(template, div_id, attr_key, attr_value){
	template.find('#'.concat(div_id)).attr(attr_key, attr_value)
}


function UpdateKsuAttribute(ksu_id, attr_key, attr_value){
	
	// console.log(attr_key);
	// console.log(attr_value);

	$.ajax({
		type: "POST",
		url: "/",
		dataType: 'json',
		data: JSON.stringify({
			'ksu_id': ksu_id,					
			'user_action': 'UpdateKsuAttribute',
			'attr_key':attr_key,
			'attr_value':attr_value,
		})
	})
	
	.done(function(data){
		console.log(data);
		if(data['event_dic']){
			render_event(data['event_dic'])
		}
	})
};


function FixTheoryView(){
	var selected_section = $('.SelectedSection').first().attr('value');
	var section_ksu_type = section_details[selected_section]['new_ksu_type'];
	var holder = section_details[selected_section]['holder'];

	var holders = ['TheoryHolder', 'HistoryHolder', 'SettingsHolder', 'DashboardHolder', 'StreakHolder', 'PiggyBankHolder'];
	for (var i = holders.length - 1; i >= 0; i--) {
		$('#' + holders[i]).addClass('hidden')
	}
	
	$('#' + holder).removeClass('hidden')


	if( holder == 'TheoryHolder'){
		var ksu_set = $('.KSU');

		for (var i = ksu_set.length - 1; i >= 0; i--) {
			var ksu = $(ksu_set[i]);
			
			if(selected_section == 'mission'){
				ksu.hide()
				if(InMission(ksu)){
					ksu.show()
				}

			} else if(selected_section == 'purpose'){

				ksu.hide()
				if(InPurpose(ksu)){
					ksu.show()
				}

			} else if( selected_section != 'search'){				
				if(ksu.attr('ksu_type') == section_ksu_type){
					ksu.show()
				} else {
					ksu.hide()
				}

			} else {
				var search_string = $('#search_string').val()
				
				if(InSearch(ksu, search_string)){
					ksu.show()
				} else {
					ksu.hide()
				}
			}
		}
	} 

	if( holder == 'DashboardHolder'){

		var TodayDate = new Date().toJSON().slice(0,10).replace(/-/g,'-');
		
		var period_end_date = $('#period_end_date')
		var period_duration = $('#period_duration')
		
		if(period_end_date.val() == ''){
			period_end_date.val(TodayDate)
		}

		if(period_duration.val() == ''){
			period_duration.val(7)
		}

		$.ajax({
			type: "POST",
			url: "/",
			dataType: 'json',
			data: JSON.stringify({
				'user_action': 'RetrieveDashboard',
				'period_end_date': period_end_date.val(),
				'period_duration': period_duration.val(),
			})
		}).done(function(data){
			RenderDashboard(data['dashboard_sections'])
		})
	}
	
	$('#CreateNewKSU').prop("disabled", section_ksu_type == 'disabled')


	function InSearch(ksu, search_string){
		var search_range = '';
		var textareas = ksu.find('textarea');
		
		for (var i = textareas.length - 1; i >= 0; i--) {
			search_range = search_range.concat($(textareas[i]).val())
		}
		
		get_ksu_attr_value(ksu, 'description');
		
		search_range = search_range.toLowerCase()	
		var words_searched = search_string.toLowerCase().split();
		
		for (var j = words_searched.length - 1; j >= 0; j--) {
			if(!search_range.includes(words_searched[j]))
			return false 
		}

		return true
	}

	function InMission(ksu){
		var TodayDate = new Date().toJSON().slice(0,10).replace(/-/g,'-');
		var target_date = get_ksu_attr_value(ksu, 'event_date');
		var ksu_type = get_ksu_attr_value(ksu, 'ksu_type');

		if(target_date == '' || !(inList(ksu_type, ['Action', 'Indicator']))){
			return false
		}
		return target_date <= TodayDate
	}

	function InPurpose(ksu){
		var ksu_type = get_ksu_attr_value(ksu, 'ksu_type');
		var status = get_ksu_attr_value(ksu, 'status');

		if(status == 'Pursuit' && ksu_type != 'Action'){
			return true
		}

		return false	
	}	
};


function FormatBasedOnStatus(ksu, status){
	var display_section = ksu.find('#KSUdisplaySection');
	var clases_to_be_removed = [
		'IsRealized',
		'IsHistory', 
		'IsCritical',
		'IsOptional',
	]

	for (var i = clases_to_be_removed.length - 1; i >= 0; i--) {
		display_section.removeClass(clases_to_be_removed[i]);
	}

	var StatusFormat = {
		'Present': 'IsRealized',
		'Past': 'IsHistory',
		'Critical': 'IsCritical',
		'Optional': 'IsOptional',
		'Memory': 'IsRealized',
	}

	if (status in StatusFormat){
		display_section.addClass(StatusFormat[status]);
	}

	if(get_ksu_attr_value(ksu, 'ksu_type') == 'Action'){
		if(get_ksu_attr_value(ksu, 'size') == 0){
			display_section.addClass('IsRealized');
		}
	}

}


function RenderDashboard(dashboard_sections){
	// console.log(dashboard_sections)
	var section_dic, section_type, template, sub_section_template, attributes, sub_section;
	$('.DashboardRenderedSection').remove();

	for (var i = dashboard_sections.length - 1; i >= 0; i--) {
		
		section_dic = dashboard_sections[i]
		section_type = section_dic['section_type']
		sub_sections = section_dic['sub_sections']
		
		template = $('#' + section_type + '_Template').clone();
		template.attr('id', '')
		template.addClass('DashboardRenderedSection')

		if('title' in section_dic){
			var title_string = section_dic['title']

			if(title_string.length > 55){
				title_string = title_string.substring(0, 55) + '...'
			}

			template.find('#SectionTitle').text(title_string)
		}
		
		if(section_type == 'KsuSummary'){
			template.find('#glyphicon').addClass(ksu_type_glyphicons[section_dic['ksu_type']])
		}

		var col_size = {2:'col-xs-6', 3:'col-xs-4', 4:'col-xs-3', 6:'col-xs-2'};

		for (var j = sub_sections.length - 1; j >= 0; j--) {
			sub_section_dic = sub_sections[j];
			sub_section_template = template.find('#SubSection_Template').clone()
			sub_section_template.attr('id', '')
			sub_section_template.addClass(col_size[sub_sections.length])
			sub_section_template = RenderDashboardSubsection(sub_section_dic, sub_section_template)
			sub_section_template.removeClass('hidden');
			sub_section_template.prependTo(template.find('#SubSections_Holder'))
		} 

		template.removeClass('hidden');
		template.prependTo('#DashboardHolder');
	}

}

function RenderDashboardSubsection(sub_section_dic, sub_section_template){
	
	attributes = sub_section_template.find('.SectionAttr');		
	for (var x = attributes.length - 1; x >= 0; x--) {
		SectionAttr = $(attributes[x]);
		SectionAttr.text(sub_section_dic[SectionAttr.attr("name")])
	}
	
	if('operator' in sub_section_dic){
		sub_section_template.find('#'+sub_section_dic['operator']).removeClass('hidden')
	}

	if('glyphicon' in sub_section_dic){
		sub_section_template.find('#glyphicon').addClass(sub_section_dic['glyphicon'])
	}

	if('goal' in sub_section_dic){
		sub_section_template.find('#goal').removeClass('hidden')
	}

	return sub_section_template
}


// ------------ Constants -------------------
var ksu_type_attr_details = {
	'Action': [['description', 'placeholder', 'What is the key action you need to take?']], 
	'Objective': [['description', 'placeholder', 'What would you need to acomplish to know you are making progress?']], 
	'Contribution': [['description', 'placeholder', "What impact do you want to have in others persons lives?"]], 
	'Experience': [['description', 'placeholder', 'What experience would you give you joy?']], 
	'SelfAttribute': [['description', 'placeholder', 'What is one of the attributes of the best person you could be?']], 
	'Person': [['description', 'placeholder', 'Who is important to you?']], 
	'Possesion': [['description', 'placeholder', 'What is a possesion that makes sense for you to care about?']], 
	'Wisdom': [['description', 'placeholder', 'What pice of knowledge could help you live a better life?']], 
	'Indicator': [['description', 'placeholder', 'Indicator place holder']], 
	'Environment': [['description', 'placeholder', 'In what environment would you like to live in?']],
}


var ksu_type_glyphicons = {
	'Action': 'glyphicon-tower', 
	'Objective': 'glyphicon-road', 
	'Contribution': 'glyphicon-globe', 
	'Experience':'glyphicon-gift', 
	'SelfAttribute':'glyphicon-user', 
	'Person':'glyphicon-heart', 
	'Possesion': 'glyphicon-wrench', 
	'Wisdom': 'glyphicon-tree-deciduous', 
	'Indicator': 'glyphicon-scale', 
	'Environment': 'glyphicon-home',
}


var section_details = {
	

	'mission':{'title': "Today's Mission", 'new_ksu_type': 'Action', 'holder':'TheoryHolder'},
	'kas': {'title': 'Key Action Set', 'new_ksu_type': 'Action', 'holder':'TheoryHolder'},  
	'objectives': {'title': 'Milestones', 'new_ksu_type': 'Objective', 'holder':'TheoryHolder'}, 
	'purpose':{'title': "Current Purpose", 'new_ksu_type': 'disabled', 'holder':'TheoryHolder'},

	'contributions': {'title': 'Contributions', 'new_ksu_type': 'Contribution', 'holder':'TheoryHolder'}, 
	'experiences': {'title': 'Joy Generators', 'new_ksu_type': 'Experience', 'holder':'TheoryHolder'},  
	'mybestself': {'title': 'Mybestself', 'new_ksu_type': 'SelfAttribute', 'holder':'TheoryHolder'},  
	'people': {'title': 'Important People', 'new_ksu_type': 'Person', 'holder':'TheoryHolder'},  
	'possesions': {'title': 'Possesions', 'new_ksu_type': 'Possesion', 'holder':'TheoryHolder'},  
	'environment': {'title': 'Environment', 'new_ksu_type': 'Environment', 'holder':'TheoryHolder'},

	'wisdom': {'title': 'Wisdom', 'new_ksu_type': 'Wisdom', 'holder':'TheoryHolder'},
	'dashboard': {'title': 'Dashboard', 'new_ksu_type': 'disabled', 'holder':'DashboardHolder'},
	'indicators': {'title': 'Indicators', 'new_ksu_type': 'Indicator', 'holder':'TheoryHolder'},
	'settings': {'title': 'Settings', 'new_ksu_type': 'disabled', 'holder':'SettingsHolder'},
	'money': {'title': 'Money Requirements', 'new_ksu_type': 'disabled', 'holder':'MoneyRequirementsHolder'},

	'search':{'title': 'Search Results', 'new_ksu_type': 'disabled', 'holder':'TheoryHolder'},
	'history':{'title': 'History', 'new_ksu_type': 'disabled', 'holder':'HistoryHolder'},
	'piggy_bank': {'title': 'Piggy Bank', 'new_ksu_type': 'disabled', 'holder':'PiggyBankHolder'},
	'streak':{'title': 'Flame Log', 'new_ksu_type': 'disabled', 'holder':'StreakHolder'},	
}



/////////////////////////////////////////////////////////////////////////////////////


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



$('.ExperienceCheckbox').on('change',function(){
	var ksu = $(this).closest('#NewKSU');
	if (ksu.attr("value") != 'NewKSU'){
		ksu = $(this).closest('#MissionKSU')
	};

	ksu.find('#ExpectedImpactRow').toggleClass('hidden');
	ksu.find('#JGSizeRow').toggleClass('hidden');
	ksu.find('#ksu_timer').toggleClass('hidden');
	ksu.find('#ksu_timer_button').toggleClass('hidden');	
});



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

function AdjustTextAreaHeight(target_textarea){
		var scrollHeight = target_textarea[0].scrollHeight
		var lineHeight = parseInt(target_textarea.css('line-height').replace('px',''));      	
		target_textarea[0].rows = Math.ceil((scrollHeight - 4)/lineHeight)
}


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

});





