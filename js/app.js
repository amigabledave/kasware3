var ksu_type_attributes, attributes_guide, reasons_guide, $zoom, t, start_time, user_today;

//Visibility variables
var selected_section, section_ksu_type, search_string, strategy_ksu_id, hide_private_ksus;
var invalid_dic = {}; 


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
		user_today = data['user_today']	
		selected_section = $('.SelectedSection').first().attr('value');	
		section_ksu_type = section_details[selected_section]['new_ksu_type'];
		hide_private_ksus = $('#hide_private_ksus').prop("checked")		
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

		$("#TheoryHolder").sortable();
		fix_strategy_ksu('')
	})

	$('#center_column').css({'height': $(window).height()})
	$('#SectionSelectionBar').css({'min-height': $(window).height()})
	ShowOptionsBasedOnView('mission')	
});


function fix_strategy_ksu(ksu_id){
	add_reason_select_to_ksu($("#strategy_ksu"), ksu_id)
	$("#strategy_ksu").find('#reason_label').text('Show pieces connected to:')
	$("#strategy_ksu").find('#reason_label').addClass('SideOptionsTitle')	
	$("#strategy_ksu").find('.ReasonSelect').removeClass('ReasonSelect');
}


$(window).on('resize', function(){
	$('#center_column').css({'height': $(window).height()})
	$('#SectionSelectionBar').css({'min-height': $(window).height()})
})


$('.SectionButton').on('click', function(){
	section = $(this).attr('value');
	
	$('.SelectedSection').removeClass('SelectedSection')
	$(this).addClass('SelectedSection').blur()
	
	if(section != 'more'){
		fix_strategy_ksu('')
		strategy_ksu_id = undefined

		$('#SectionTitle').text(section_details[section]['title']);
		selected_section = section
		section_ksu_type = section_details[selected_section]['new_ksu_type'];
		FixTheoryView()
		window.scrollTo(0, 0);
		ShowOptionsBasedOnView(section)
	
	} else {
		$('#more_buttons').toggleClass('hidden')
		$('#ShowMoreSpan').toggleClass('hidden')
		$('#ShowLessSpan').toggleClass('hidden')
		
	}
});


$('#CreateNewKSU').on('click',function(){
	CreateNewKSU()
	
	function CreateNewKSU(){
		var ksu_type = section_ksu_type;
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
		// new_ksu.show()
		if(strategy_ksu_id){new_ksu.find('#reason_holder').attr('reason_id', strategy_ksu_id)}

		ShowDetail(new_ksu);		
		new_ksu.find('#description').focus();


		if(selected_section == 'mission'){
			// var TodayDate = new Date().toJSON().slice(0,10).replace(/-/g,'-');
			var TodayDate = user_today;	
			set_ksu_attr_value(new_ksu, 'event_date', TodayDate)
		}
		return new_ksu
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
		$('#CreateNewKSU').focus()

		ksu.attr("value","")
		
		// var lower_importance = parseInt(ksu.next().attr("importance"));
		
		// if (isNaN(lower_importance)){
		// 	lower_importance = 0;
		// }

		// var importance = lower_importance + 10000
		console.log($('.KSU').last())
		var top_importance = parseInt($('.KSU').last().attr("importance"));
		console.log(top_importance)
		if (isNaN(top_importance)){
			top_importance = 0;
		}

		var importance = top_importance + 10000
		
		ksu.attr("importance",importance)
		
		var attributes_dic = {};
		var ksu_attributes = ksu.find('.KsuAttr');
		
		for (var i = ksu_attributes.length - 1; i >= 0; i--) {
			var KsuAttr = $(ksu_attributes[i]);
			attributes_dic[KsuAttr.attr("name")] = get_ksu_attr_value(ksu, KsuAttr.attr("name"))
		} 
		
		attributes_dic['user_action'] = 'SaveNewKSU';
		attributes_dic['reason_id'] = ksu.find('#reason_holder').attr('reason_id');		
		attributes_dic['importance'] = importance;
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

			console.log($('#strategy_ksu').find('#reason_id').val())
			fix_strategy_ksu($('#strategy_ksu').find('#reason_id').val());

			if(ksu.hasClass('PictureOnStandBy')){
				AddKsu_idToPicInput(ksu);
				ksu.removeClass('PictureOnStandBy');
				ksu.find('#SavePic').trigger('click');
			}
			FixKsuVisibility(ksu)
			ksu.appendTo('#TheoryHolder');

		});	
	};

	function DeleteKSU(ksu){
		if(ksu.attr("value")==""){
			ksu.remove()
		} else {
			$.ajax({
				type: "POST",
				url: "/",
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
		FixKsuVisibility(ksu) 
		return
	};

	function UpdateEventDate(ksu){		
		console.log('Update event date...')
		if(ksu.attr("value")==''){
			var event_date = '';
			if(action == 'Action_Pushed') {
				var TodaysDate = new Date();	
				var system_today = TodaysDate.toJSON().slice(0,10).replace(/-/g,'-')		

				var additional_days = 0
				if(system_today == user_today){additional_days = 1}
				
				event_date = new Date(TodaysDate.getFullYear(), TodaysDate.getMonth(), TodaysDate.getDate() + additional_days, 0, 0, 0, 0).toJSON().slice(0,10).replace(/-/g,'-')				
			} else if(action == 'SendToMission'){
				event_date = user_today
			}
			set_ksu_attr_value(ksu, 'event_date', event_date)
			return
		}
		
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
			if(selected_section == 'mission' && inList(action, ['Action_Skipped','Action_Pushed'])){
				ksu.addClass('hidden');				
			}

			ShowDetail(ksu);	
		});			
	};

	function ActionDone(ksu){
		console.log('Action Done...')
		
		var ksu_subtype = get_ksu_attr_value(ksu, 'ksu_subtype');
		var score =	ksu.find('#'+ ksu_subtype +'_Merits').text();
		ksu.fadeOut('slow');
		ksu.remove()
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
				var updated_ksu = render_ksu(data['ksu_dic']);
				FixKsuVisibility(updated_ksu)		
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
		ksu.remove()
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
			var updated_ksu = render_ksu(data['ksu_dic']);
			FixKsuVisibility(updated_ksu)	
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

$(document).on('dragstart', '.KSU', function(){
	console.log('Si se dio cuenta del dragstart...')
	var ksu = $(this)
	var posicion_inicial = ksu.index() - 1;
	
	$( ".KSU" ).on("dragend", function(){
		var posicion_final = ksu.index();
		var valor_inferior = parseInt(ksu.next().attr("importance"));
		var valor_superior = parseInt(ksu.prev().attr("importance"));
		
		// console.log('Este es el valor valor inferior:')
		// console.log(valor_inferior)
		// console.log('Este es el valor superior:')
		// console.log(valor_superior)

		if (isNaN(valor_inferior)){
			valor_inferior = 0;
		}

		if (isNaN(valor_superior)){
			valor_superior = valor_inferior + 20000
		}		

		if (posicion_final != posicion_inicial){
			var new_importance = Math.round((valor_inferior+valor_superior)/2)			
			ksu.attr("importance", new_importance)
			UpdateKsuAttribute(ksu.attr("value"), 'importance', new_importance)
		} else {
			console.log('No hubo cambio de posicion')

		} 

		$(".KSU").off( "dragend");
	});
});


$("#TheoryHolder").on('sortstart', function(ev, ui){	
	
	var ksu = $(ui.helper.context)
	var posicion_inicial = ksu.index();
	
	$("#TheoryHolder").on("sortstop", function(){
		
		var posicion_final = ksu.index();
		if (posicion_final != posicion_inicial){

			var valor_inferior = parseInt(ksu.next().attr("importance"));
			var valor_superior = parseInt(ksu.prev().attr("importance"));
			
			if (isNaN(valor_inferior)){
				valor_inferior = 0;
			}

			if (isNaN(valor_superior)){
				valor_superior = valor_inferior + 20000
			}				
			var new_importance = Math.round((valor_inferior+valor_superior)/2)			
			ksu.attr("importance", new_importance)
			UpdateKsuAttribute(ksu.attr("value"), 'importance', new_importance)
		} 

		$("#TheoryHolder").off("sortstop");
	});
});


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
			url: "/",
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
	// console.log('Se reconocio que se esta acutalizando un attributo')
	// console.log(initial_attr_value)
	$(this).on('focusout', function(){
		
		var attr_value = get_ksu_attr_value(theory, $(this).attr("name"));
		
		if(initial_attr_value != attr_value){
			// console.log('Se reconocio que el attributo cambio')
			hide_private_ksus = $('#hide_private_ksus').prop("checked")
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


$('#strategy_ksu').on('change', function(){
	var new_strategy_ksu_id = $('#strategy_ksu').find('#reason_id').val()
	if (strategy_ksu_id != new_strategy_ksu_id){
		strategy_ksu_id = new_strategy_ksu_id		
		FixTheoryView()
	}	
})


$(document).on('change', '.ReasonSelect', function(){
	var ksu = $(this).closest('#KSU');
	var attr_value = get_ksu_attr_value(ksu, $(this).attr("name"));
	var old_value = ksu.find('#reason_holder').attr('reason_id');
	
	if (attr_value == old_value){return};
	ksu.find('#reason_holder').attr('reason_id', attr_value)
	// if (ksu.attr("value") == ''){return};
	
	var ksu_id = ksu.attr("value");
	// HideShowLinkType(ksu)
	
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
	ksu.attr("importance", ksu_dic['importance'])
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

	// ksu.prependTo('#TheoryHolder');
	ksu.appendTo('#TheoryHolder');
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

	return ksu
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
		var option_views = option.attr('target_view')
		if( option_views == 'theory'){
			option_views = 'mission kas objectives purpose contributions experiences mybestself people possesions environment wisdom indicators search' 
		}

		if( option_views.includes(target_view)){
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


function FixKsuVisibility(ksu){
	
	ksu.addClass('hidden')
	
	if(hide_private_ksus && get_ksu_attr_value(ksu, 'is_private')){return}

	if(strategy_ksu_id){
		var reason_id = ksu.find('#reason_holder').attr('reason_id')
		if(strategy_ksu_id != reason_id){return}
	}

	// var invalid_options = $('#SideOptionsContainer').find("input:checkbox:not(:checked)");
	// console.log(invalid_options)
	// for (var i = invalid_options.length - 1; i >= 0; i--) {
	// 	var option = invalid_options[i]
	// 	var invalid_value = option.attr('invalid_value')
	// 	var target_attr = option.attr('target_attr')
	// 	if(get_ksu_attr_value(ksu, target_attr) == invalid_value){return}
	// } // XX Aqui nos quedamos intentando hacer que se oculten los subtypos not checked

	var is_visible = true

	if(selected_section == 'mission'){
		is_visible = InMission(ksu)

	} else if(selected_section == 'purpose'){
		is_visible = InPurpose(ksu)

	} else if( selected_section != 'search'){
		is_visible = ksu.attr('ksu_type') == section_ksu_type 

	} else {
		is_visible = InSearch(ksu, search_string)
	}

	if(is_visible){
		ksu.removeClass('hidden')
	}

	function InSearch(ksu, search_string){
		if (ksu.attr("value") == ''){return false};
		var search_range = '';
		var textareas = ksu.find('textarea');
		
		for (var i = textareas.length - 1; i >= 0; i--) {			
			search_range = search_range + ' ' + $(textareas[i]).val()
		}
		search_range = search_range + ' ' + ksu.find('#tag').val()
		
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
		// var TodayDate = new Date().toJSON().slice(0,10).replace(/-/g,'-');
		var TodayDate = user_today;
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
}


function FixTheoryView(){	

	var holder = section_details[selected_section]['holder'];

	var holders = ['TheoryHolder', 'HistoryHolder', 'SettingsHolder', 'DashboardHolder', 'StreakHolder', 'PiggyBankHolder'];
	for (var i = holders.length - 1; i >= 0; i--) {
		$('#' + holders[i]).addClass('hidden')
	}
	
	$('#' + holder).removeClass('hidden')

	if( holder == 'TheoryHolder'){

		var ksu_set = $('.KSU');
		search_string = $('#search_string').val()
		
		for (var i = ksu_set.length - 1; i >= 0; i--) {
			var ksu = $(ksu_set[i]);
			FixKsuVisibility(ksu)
			
		}		
	} 

	if( holder == 'DashboardHolder'){

		// var TodayDate = new Date().toJSON().slice(0,10).replace(/-/g,'-');
		var TodayDate = user_today;

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
	
