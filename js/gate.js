
$(document).ready(function(){
	console.log('The gate has been activated!')	

	var gate_questions = [
		'#question_es',
		'#question_jp',
		'#question_fr',
		'#question_po',
		'#question_ch',
		'#question_ge',
		'#question_la',
		'#question_ar',
		'#question_en'
	];

	var main_question = [
		"#q1",
		"#q2",
		"#q3",
		"#q4",
		"#q5",
		"#q6",
		"#q7",
		"#q8",
		"#q9",
		"#q10",
		"#q11",
		"#q12",
		"#q13",
		"#q14",
	]

	for (var i = gate_questions.length - 1; i >= 0; i--) {
		$(gate_questions[i]).removeClass('hidden').fadeOut("fast")
		UnhideQuestion(gate_questions[i], i)
	}

	function UnhideQuestion(question, seconds) {
	  // setTimeout(function() {$(question).removeClass('hidden') }, seconds*1000);
	  setTimeout(function() {$(question).fadeIn("slow") }, seconds*1000);;
	}

});

