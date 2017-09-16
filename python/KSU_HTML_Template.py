KSU_HTML_Template ="""
<div class="row KSUdisplaySection" id="MissionKSU" value="{{ksu.key.id()}}" style="margin-top: 0px; padding-bottom:13px; padding-left:5px; padding-right:5px; padding-top:13px;">
	<div class="col-xs-12">
		<div class="row" id="KSUPreview">
			<div class="col-xs-1" style="padding-right:0; padding-left:8px;">
				
				{% if ksu.ksu_subtype not in ['ImIn', 'Diary'] %}
				<button type="button" class="btn btn-{% if ksu.ksu_subtype == 'KAS4' %}danger{% else %}success{% endif %} btn-circle btn-lg UserActionButton" name="action_description" value='MissionDone'><i class="glyphicon glyphicon-ok"></i></button>
				{% else %}
				<button type="button" class="btn btn-success btn-circle btn-lg UserActionButton" name="action_description" value='MissionRecordValue'><span class="glyphicon glyphicon-record"></span></button>
				{% endif %}
				{% if ksu.ksu_subtype in ['KAS3', 'KAS4'] %}
					<button type="button" class="btn btn-{% if ksu.ksu_subtype == 'KAS4' %}success{% else %}warning{% endif %} btn-circle btn-lg UserActionButton" style="margin-top:10px;" name="action_description" value='MissionSkip'><span class="glyphicon glyphicon-remove"></span></button>
				{% endif %}
			</div>

			<div class="col-xs-11">
				<div class="row" id="DescriptionRow">
					<div class="col-xs-12">

					{% if ksu.ksu_subtype == 'KAS3' %}

						<span style="color:#32CD32; font-style:italic; font-weight:bold; font-size:12px;">Did you have this reaction?: </span>
						<textarea style="width:100%; font-weight:normal; font-style:italic; border:0;" class="QuickAttributeUpdate autoExpand" rows="{{ksu.secondary_description_rows}}" data-min-rows='{{ksu.secondary_description_rows}}' name="secondary_description" id="secondary_description">{{ksu.secondary_description}}</textarea>							
						<textarea style="width:100%; border:0; font-weight:bold; {% if ksu.is_critical and ksu.is_active %}color:#B22222;{% elif not ksu.is_active %}color:#b1adad;{% endif %}" class="QuickAttributeUpdate autoExpand" rows="{{ksu.description_rows}}" data-min-rows='{{ksu.description_rows}}' name="description" id="description">{{ksu.description}}</textarea>

					{% elif ksu.ksu_subtype == 'KAS4' %}
						<span style="color:red; font-style:italic; font-weight:bold; font-size:12px;"> Did you manage to avoid?:</span> 
						<textarea style="width:100%; border:0; font-weight:bold; {% if ksu.is_critical and ksu.is_active %}color:#B22222;{% elif not ksu.is_active %}color:#b1adad;{% endif %}" class="QuickAttributeUpdate autoExpand" rows="{{ksu.description_rows}}" data-min-rows='{{ksu.description_rows}}' name="description" id="description">{{ksu.description}}</textarea>

					{% elif ksu.ksu_subtype in ['ImPe', 'ImIn'] %}
						<textarea style="width:100%; height:20px; border:0; {% if ksu.is_critical %}color:#B22222;{% endif %}{% if ksu.ksu_suptype = 'ImIn' %}font-weight: bold;{% endif %}" class="QuickAttributeUpdate" name="secondary_description" id="secondary_description" rows="{{ksu.description_rows}}" data-min-rows='{{ksu.description_rows}}'>{{ksu.secondary_description}}</textarea>
					{% elif ksu.is_mini_o %}
						<textarea style="width:100%; border:0; font-size:14px; font-weight:bold; font-style:italic;{% if ksu.is_critical %}color:#B22222;{% endif %}" class="autoExpand QuickAttributeUpdate" rows="{{ksu.description_rows}}" data-min-rows='{{ksu.description_rows}}' name="description" id="description" placeholder="What do you want to achieve?">{{ksu.description}}</textarea>

						<textarea style="width:100%; border:0; font-size:14px;" class="autoExpand QuickAttributeUpdate" rows="1" data-min-rows='1' name="secondary_description" id="secondary_description" placeholder="What is the next step?">{% if ksu.secondary_description %}{{ksu.secondary_description}}{% endif %}</textarea>

					{% else %}	
						<textarea style="width:100%; border:0; {% if ksu.is_critical %}color:#B22222;{% endif %}" class="QuickAttributeUpdate autoExpand" rows="{{ksu.description_rows}}" data-min-rows='{{ksu.description_rows}}' name="description" id="description">{{ksu.description}}</textarea>

						<textarea style="width:100%; border:0; font-size:14px;" class="autoExpand QuickAttributeUpdate hidden" rows="1" data-min-rows='1' name="secondary_description" id="secondary_description" placeholder="What is the next step?">{% if ksu.secondary_description %}{{ksu.secondary_description}}{% endif %}</textarea>
					{% endif %}
					</div>
				</div>
				
				<div class="row" style="margin-top:5px;" id="TagsImportanceRow">
				{% if ksu.ksu_subtype not in ['ImIn', 'Diary' %}
				
					{% if time_frame == 'Today' %}
					<div class="col-xs-5 col-sm-3">	
						{% if ksu.ksu_subtype not in ['KAS3', 'KAS4'] %}
						<input style="padding-right:2px; padding-left:4px; border:0; color:purple; width:100px; margin-bottom:3px;" type="time" class="QuickAttributeUpdate" name="best_time" id="best_time" value={% if ksu %}{{ksu.best_time}}{% endif %}>
						{% endif %}
					</div>
					{% else %}
					<div class="col-xs-5 col-sm-4"">
						{% if ksu.ksu_subtype not in ['KAS3', 'KAS4'] %}	
						<input type="date" class="QuickAttributeUpdate" style="padding-right:2px; padding-left:4px; border:0; color:purple; width:127px; margin-bottom:3px;" name="next_event" id="next_event" value="{% if ksu %}{{ksu.next_event}}{% endif %}">
						{% endif %}
					</div>
					{% endif %}

					<div class="col-xs-2 col-sm-2" style="padding-left:0; font-weight:bold; padding-right:5px; text-align:right;">
						<input type="number" min="1" max="100" class="kpts_value QuickAttributeUpdate MissionKsuKpts" style="border:0;{% if ksu.ksu_subtype == 'KAS4' %}color:red;{% endif %}" name="kpts_value" id="kpts_value" value="{{ksu.kpts_value|round|int}}" placeholder="KPs">	
					</div>	

					
					<div class="hidden-xs {% if time_frame == 'Today' %}col-sm-5{% else %}col-sm-4{% endif %}">
						<input class="QuickAttributeUpdate" style="color:purple; font-weight:bold; border:0; width:170px; text-align:center; margin-left:-10px;" type="text" list="tags" name="tags" id="tags" value="{% if ksu.tags %}{{ksu.tags}}{% endif %}"> 
					</div>
					<div class="col-xs-1 hidden-sm hidden-md hidden-lg"></div>
					<div class="col-xs-1" style="padding-left:0px;">
							<select class="QuickAttributeUpdate" style="border:0; color:purple; font-weight:bold; margin-left:-10px;" name="mission_importance" id="mission_importance">
								{% for value in range(1,6) %}													
									{% if value == ksu.mission_importance %}
										<option selected="selected" value="{{value}}"> {{value}} </option>
									{% else %}
										<option value="{{value}}"> {{value}} </option>
									{% endif %}
								{% endfor %}
							</select>
					</div>
					<div class="col-xs-1 hidden-sm hidden-md hidden-lg"></div>
					<div class="col-xs-1" style="padding-left:0px">
						<button type="button" class="btn btn-default displaySectionVerticalButton ShowDetailViewerButton ViewerOptionsButton" id="ShowDetailViewerButton">
							<span id="PlusMinusGlyphicon" class="glyphicon glyphicon-plus" style="margin-left:2px;"></span></button>
					</div>
				{% else %}

					<div class="col-xs-2 col-sm-1">	
						<div class="hidden-xs col-sm-1" style="padding:0;">
							<button type="button" class="btn btn-warning btn-circle btn-lg UserActionButton" name="action_description" value='MissionSkip'><span class="glyphicon glyphicon-remove"></span></button>					
						</div>
					</div>
					
					{% if ksu.ksu_subtype == 'Diary' %}
					<div class="col-xs-8 col-sm-10">
						<textarea style="width:100%;" class="form-control autoExpand" rows="1" data-min-rows='1' name="event_secondary_comments" id="event_secondary_comments" placeholder="Entry title"></textarea>
					</div>

					<div class="hidden-xs col-sm-1" style="padding:0;">	
						<button type="button" class="btn btn-default btn-circle ShowDetailViewerButton" id="ShowDetailViewerButton"><span id="PlusMinusGlyphicon" class="glyphicon glyphicon-plus"></span></button>
					</div>

					<div class="col-xs-10 col-sm-12">
						<textarea style="width:100%;" class="form-control autoExpand" name="event_comments" id="event_comments" rows="1" placeholder="Your answer goes here"></textarea>
					</div>
					{% else %}
					<div class="col-xs-8 col-sm-3">
						{% if ksu.ksu_subtype in ['BinaryPerception', 'FibonacciPerception'] %}
							<select class="form-control" name="indicator_value" id="select_indicator_value" style="margin-bottom:5px;">
								{% if ksu.ksu_subtype == 'BinaryPerception' %}
									<option value="1"> Yes </option>
									<option value="0"> No </option>
								{% elif ksu.ksu_subtype == 'FibonacciPerception' %}
									<option value="1">1</option>
									<option value="2">2</option>
									<option selected="selected" value="3">3</option>
									<option value="5">5</option>
									<option value="8">8</option>
								{% endif %}
							</select>
						{% elif ksu.ksu_subtype == 'RealitySnapshot' %}
							<input type="number" min="0" class="form-control" name="indicator_value" id="open_indicator_value" placeholder="0" style="margin-bottom:5px;">
						{% endif %}
					</div>

					<div class="col-xs-2 hidden-sm hidden-md hidden-lg">
						<button type="button" class="btn btn-warning btn-circle btn-lg UserActionButton" name="action_description" value='MissionSkip'><span class="glyphicon glyphicon-remove"></span></button>
					</div>

					<div class="col-xs-10 col-sm-7">
						<textarea style="width:100%;" class="form-control autoExpand" name="event_comments" id="event_comments" rows="1" placeholder="Comments on this result?"></textarea>
					</div>
					{% endif %}

					<div class="col-xs-2 hidden-sm hidden-md hidden-lg">
						<button type="button" class="btn btn-default btn-circle ShowDetailViewerButton" id="ShowDetailViewerButton"><span id="PlusMinusGlyphicon" class="glyphicon glyphicon-plus"></span></button>
					</div>

					{% if ksu.ksu_type != 'Diary' %}
					<div class="hidden-xs col-sm-1" style="padding:0;">	
						<button type="button" class="btn btn-default btn-circle ShowDetailViewerButton" id="ShowDetailViewerButton"><span id="PlusMinusGlyphicon" class="glyphicon glyphicon-plus"></span></button>
					</div>
					{% endif %}
				{% endif %}
				</div>
			</div>
		</div>
		
		<div class="row hidden" id="KSUDetail">
			<div class="col-xs-12">
				<hr class="hr-1px-gray" style="margin-top:4px; margin-bottom:10px;">
				<div class="row" id="UserActionsRow">
					
					<div class="col-xs-6 hidden-sm hidden-md hidden-lg">
						<input style="color:purple; text-align:center; font-weight:bold; border:0; width:100%;" class="QuickAttributeUpdate" placeholder="Tag" type="text" list="tags" name="tags" id="tags" value="{% if ksu.tags %}{{ksu.tags}}{% endif %}">
					</div>
				
						
					<div class="co-xs-6 hidden-sm hidden-md hidden-lg">
						{% if time_frame == 'Today' %}				
						<button type="button" class="btn btn-warning btn-circle btn-lg UserActionButton" name="action_description" value='MissionPush' style="margin-right:10px;"><span class="glyphicon glyphicon-forward"  style="margin-left:5px;"></span></button>
						<button type="button" class="btn btn-warning btn-circle btn-lg UserActionButton" name="action_description" value='MissionSkip' style="margin-right:10px;"><span class="glyphicon glyphicon-remove""></span></button>
						{% else %}
						<button type="button" class="btn btn-primary btn-circle btn-lg UserActionButton ShowDetailViewerButton" name="action_description" value='SendToMission' style="margin-right:10px;"><span class="glyphicon glyphicon-share-alt"></span></button>
						{% endif %}
						<button type="button" class="btn btn-danger btn-circle btn-lg UserActionButton" name="action_description" value='MissionDelete' style="margin-right: 10px;"><span class="glyphicon glyphicon-trash"></span></button>
					</div>


					<div class="col-xs-4 col-sm-2">
						<div class="checkbox"> 
							<label> <input type="checkbox" id="is_active" class="QuickAttributeUpdate" name="is_active" {% if ksu.is_active %}checked{% endif %}> <b> Active </b> </label> 
						</div>
					</div>	

					<div class="col-xs-4 col-sm-2" style="padding-left:8px;">
						<div class="checkbox"> 
							<label> <input type="checkbox" class="QuickAttributeUpdate" id="is_critical" name="is_critical" {% if ksu.is_critical %}checked{% endif %}> <b> Critical </b> </label> 
						</div>			
					</div>

					<div class="col-xs-4 col-sm-2" style="padding-left:3px;">
						<div class="checkbox"> 
				 			<label> <input type="checkbox" id="is_private" name="is_private" class="QuickAttributeUpdate" {% if ksu.is_private %}checked{% endif %}> <b> Private </b> </label> 
				 		</div>
					</div>
					
					
					<div class="hidden-xs col-sm-1"></div>
					<div class="hidden-xs col-sm-5">
						{% if time_frame == 'Today' %}					
						<button type="button" class="btn btn-warning btn-circle btn-lg UserActionButton" name="action_description" value='MissionPush' style="margin-right:10px;"><span class="glyphicon glyphicon-forward"  style="margin-left:5px;"></span></button>
						<button type="button" class="btn btn-warning btn-circle btn-lg UserActionButton" name="action_description" value='MissionSkip' style="margin-right:10px;"><span class="glyphicon glyphicon-remove""></span></button>
						{% else %}
						<button type="button" class="btn btn-primary btn-circle btn-lg UserActionButton ShowDetailViewerButton" name="action_description" value='SendToMission' style="margin-right:10px;"><span class="glyphicon glyphicon-share-alt"></span></button>
						{% endif %}
						<button type="button" class="btn btn-danger btn-circle btn-lg UserActionButton" name="action_description" value='MissionDelete' style="margin-right: 10px;"><span class="glyphicon glyphicon-trash"></span></button>
					</div>
				</div>					
				<div class="row" id="KsuPlusOptions">
					<div class="col-xs-12">
					
					{%   if ksu.ksu_subtype == 'KAS1' %}
						<hr class="hr-1px-gray" style="margin-top:5px; margin-bottom:5px;">	
						<div class="row">
							<div class="col-xs-6 col-sm-4">
								<label> Next Event </label>
								<input type="date" class="form-control QuickAttributeUpdate" style="padding-right:3px; margin-bottom:7px;" name="next_event" id="next_event" value="{% if ksu.next_event %}{{ksu.next_event}}{% endif %}">
							</div>	

							<div class="col-xs-6 col-sm-4">
								<label> Preferred Time </label>
								<input style="padding-right:2px; padding-left:4px; margin-bottom:7px;" type="time" class="form-control QuickAttributeUpdate" name="best_time" id="best_time" value="{% if ksu.best_time %}{{ksu.best_time}}{% endif %}">	
							</div>				

							<div class="col-xs-6 col-sm-4">
								<label> Repeats </label>
								<select id="repeats" class="form-control KsuEditor_Repeats QuickAttributeUpdate" name="repeats" style="margin-bottom:7px;">
									{% for f in constants['l_repeats'] %}
										{% if f[0] == ksu.repeats %}
										<option value="{{f[0]}}" selected="selected"> {{f[1]}} </option>
										{% else %}
										<option value="{{f[0]}}"> {{f[1]}} </option>	
										{% endif %}						
									{% endfor %}
								</select> 
							</div>

							<div class="col-xs-6 col-sm-4 {% if ksu.repeats == 'R007'%}hidden{% endif %}" id="repeats_every">

								<div class="row">
									<div class="col-xs-6" style="padding-right:0px;">
										<label> Every </label>
										<input type="number" min="1" class="form-control QuickAttributeUpdate" style="padding-right:3px; margin-bottom:7px;" name="frequency" id="frequency" placeholder="1" value="{% if ksu.frequency %}{{ksu.frequency}}{% endif %}"> 		
									</div>
									
									<div id="repeats_every_footnote" class="col-xs-6" style="position: absolute; bottom: 0; right: 0; padding-left: 10px; font-style: italic; margin-bottom:7px;">Days
									</div>									
								</div>		
							</div>



							<div class="col-xs-12 col-sm-8 {% if ksu.repeats != 'R007'%}hidden{% endif %}" id="repeats_on">
								<div class="row" style="margin-top:15px;">
							 		<div style="display: table; float:left; margin-right:15px;">
							 		<div class="col-xs-1" style="margin-right:10px;">
							 			<label style="display:table-row;"><b>Mon
							 			<input style="display:table-row; width:100%;" type="checkbox" {% if ksu and ksu.repeats_on['repeats_on_Mon']%}checked{% endif %}  class="QuickAttributeUpdate" name="repeats_on_Mon" id="repeats_on_Mon"></b></label>		
							 		</div><div class="col-xs-1" style="margin-right:10px;">
							 			<label style="display:table-row;"><b>Tue 
							 			<input style="display:table-row; width:100%;" type="checkbox" {% if ksu and ksu.repeats_on['repeats_on_Tue']%}checked{% endif %} class="QuickAttributeUpdate" name="repeats_on_Tue" id="repeats_on_Tue"></b></label>
									</div><div class="col-xs-1" style="margin-right:10px;">
							 			<label style="display:table-row;"><b>Wed
							 			<input style="display:table-row; width:100%;" type="checkbox" {% if ksu and ksu.repeats_on['repeats_on_Wed']%}checked{% endif %} class="QuickAttributeUpdate" name="repeats_on_Wed" id="repeats_on_Wed"></b></label> 
									</div><div class="col-xs-1" style="margin-right:10px;">			 			
							 			<label style="display:table-row;"><b>Thu 
							 			<input style="display:table-row; width:100%;" type="checkbox" {% if ksu and ksu.repeats_on['repeats_on_Thu']%}checked{% endif %} class="QuickAttributeUpdate" name="repeats_on_Thu" id="repeats_on_Thu"></b></label>
									</div><div class="col-xs-1" style="margin-right:10px;">			 		
							 			<label style="display:table-row;"><b>Fri
							 			<input style="display:table-row; width:100%;" type="checkbox" {% if ksu and ksu.repeats_on['repeats_on_Fri']%}checked{% endif %} class="QuickAttributeUpdate" name="repeats_on_Fri" id="repeats_on_Fri"></b></label> 
									</div><div class="col-xs-1" style="margin-right:10px;">			 		
							 			<label style="display:table-row;"><b>Sat 
							 			<input style="display:table-row; width:100%;" type="checkbox" {% if ksu and ksu.repeats_on['repeats_on_Sat']%}checked{% endif %} class="QuickAttributeUpdate" name="repeats_on_Sat" id="repeats_on_Sat"></b></label>
							 		</div><div class="col-xs-1" style="margin-right:10px;">
							 			<label style="display:table-row;"><b>Sun 
							 			<input style="display:table-row; width:100%;" type="checkbox" {% if ksu and ksu.repeats_on['repeats_on_Sun']%}checked{% endif %} class="QuickAttributeUpdate" name="repeats_on_Sun" id="repeats_on_Sun"></b></label>
							 		</div></div>
								</div>
							</div>

							<div class="col-xs-6 col-sm-4">
								<label> Mission View </label>
								<select class="form-control QuickAttributeUpdate" name="mission_view" id="mission_view">						
									<option value="KickOff" {% if ksu.mission_view == 'KickOff' %} selected="selected"{% endif %}>Kick Off</option>
									<option value="AnywhereAnytime" {% if ksu.mission_view == 'AnywhereAnytime' %} selected="selected"{% endif %}>Anywhere Anytime</option>
									<option value="Principal" {% if ksu.mission_view == 'Principal' %} selected="selected"{% endif %}>Principal</option>
									<option value="WrapUp" {% if ksu.mission_view == 'WrapUp' %} selected="selected"{% endif %}>Wrap Up</option>
								</select> 
							</div>
						</div>								
												
					{% elif ksu.ksu_subtype == 'KAS2' %}
						<hr class="hr-1px-gray" style="margin-top:5px; margin-bottom:5px;">
						<div class="row" style="margin-bottom:8px;">
							
							<div class="col-xs-6 col-sm-4">
							{% if time_frame == 'Today' %}
								<label> Event date </label>
								<input type="date" class="form-control QuickAttributeUpdate" style="padding-right:3px;" name="next_event" id="next_event" value="{% if ksu.next_event %}{{ksu.next_event}}{% endif %}">		
							{% else %}								
								<label> Preferred Time </label>
								<input style="padding-right:2px; padding-left:4px;" type="time" class="form-control QuickAttributeUpdate" name="best_time" id="best_time" value="{% if ksu.best_time %}{{ksu.best_time}}{% endif %}">					
							{% endif %}
							</div>	
							
							<div class="col-xs-6 col-sm-2" style="padding-left:0px;">
								<div class="checkbox"> 
									<label> <input type="checkbox" class="QuickAttributeUpdate MiniObjectiveCheckbox" id="is_mini_o" name="is_mini_o" {% if ksu.is_mini_o %}checked{% endif %}> <b> Mini Objective </b> </label> 
								</div>	
							</div>

							<div class="col-xs-12 col-sm-6">
								<label> Targeted Objective </label>
								<select class="form-control QuickAttributeUpdate" name="parent_id" id="parent_id">
									{% for (ksu_id, description, milestones) in objectives %}										
										{% if ksu.parent_id_id == ksu_id %}
										<option selected="selected" value="{{ksu_id}}"> {{description}} </option>
										{% else %}
										<option value="{{ksu_id}}"> {{description}} </option>								
										{% endif %}
										{% for (ksu_id, description) in milestones %}
											{% if ksu.parent_id_id == ksu_id %}
											<option selected="selected" value="{{ksu_id}}"> {{description}} </option>
											{% else %}
											<option value="{{ksu_id}}"> {{description}} </option>								
											{% endif %}
										{% endfor %}
									{% endfor %}
								</select>	
							</div>		
						</div>

					{% elif ksu.ksu_subtype == 'KAS3' %}
						<hr class="hr-1px-gray" style="margin-top:5px; margin-bottom:5px;">
						<div class="row" style="margin-bottom:8px;">
							<div class="col-xs-6 col-sm-4">
								<label> Mission View </label>
								<select class="form-control QuickAttributeUpdate" name="mission_view" id="mission_view">						
									<option value="KickOff" {% if ksu.mission_view == 'KickOff' %} selected="selected"{% endif %}>Kick Off</option>
									<option value="AnywhereAnytime" {% if ksu.mission_view == 'AnywhereAnytime' %} selected="selected"{% endif %}>Anywhere Anytime</option>
									<option value="Principal" {% if ksu.mission_view == 'Principal' %} selected="selected"{% endif %}>Principal</option>
									<option value="WrapUp" {% if ksu.mission_view == 'WrapUp' %} selected="selected"{% endif %}>Wrap Up</option>
								</select> 
							</div>		
						</div>

					{% elif ksu.ksu_subtype == 'KAS4' %}

						<hr class="hr-1px-gray" style="margin-top:5px; margin-bottom:5px;">
						<div class="row" style="margin-bottom:8px;">

							<div class="col-xs-6 col-sm-4">
								<label> Mission View </label>
								<select class="form-control QuickAttributeUpdate" name="mission_view" id="mission_view">						
									<option value="KickOff" {% if ksu.mission_view == 'KickOff' %} selected="selected"{% endif %}>Kick Off</option>
									<option value="AnywhereAnytime" {% if ksu.mission_view == 'AnywhereAnytime' %} selected="selected"{% endif %}>Anywhere Anytime</option>
									<option value="Principal" {% if ksu.mission_view == 'Principal' %} selected="selected"{% endif %}>Principal</option>
									<option value="WrapUp" {% if ksu.mission_view == 'WrapUp' %} selected="selected"{% endif %}>Wrap Up</option>
								</select> 
							</div>
							
							<div class="col-xs-6 col-sm-8">
								<label>Valid Exceptions</label>
								<textarea class="form-control QuickAttributeUpdate autoExpand" rows="{{ksu.secondary_description_rows}}" data-min-rows='{{ksu.secondary_description_rows}}' name="secondary_description" id="secondary_description" placeholder="e.g. When I'am on vacation, When the food its free!">{% if ksu.secondary_description %}{{ ksu.secondary_description }}{% endif %}</textarea>	
							</div>	
						</div>	

					{% elif ksu.ksu_type == 'EVPo' %}
						<hr class="hr-1px-gray" style="margin-top:0px; margin-bottom:8px;">
						<div class="row">
							<div class="col-xs-6 col-sm-4">
								<label> Next Event </label>
								<input type="date" class="form-control QuickAttributeUpdate" style="padding-right:3px;" id="next_event" name="next_event" value="{% if ksu %}{{ksu.next_event}}{% endif %}">
							</div>
							
							<div class="col-xs-6 col-sm-4"> 
								<label> Charging Time (Days) </label>			
								<input type="number" min="1" class="form-control QuickAttributeUpdate" id="frequency" name="frequency" placeholder="Days. E.g. 7" value="{% if ksu %}{{ksu.frequency}}{% endif %}">
							</div>
						
							<div class="col-xs-6 col-sm-4">
								<label> Mission View </label>
								<select class="form-control QuickAttributeUpdate" name="mission_view" id="mission_view">						
									<option value="KickOff" {% if ksu.mission_view == 'KickOff' %} selected="selected"{% endif %}>Kick Off</option>
									<option value="AnywhereAnytime" {% if ksu.mission_view == 'AnywhereAnytime' %} selected="selected"{% endif %}>Anywhere Anytime</option>
									<option value="Principal" {% if ksu.mission_view == 'Principal' %} selected="selected"{% endif %}>Principal</option>
									<option value="WrapUp" {% if ksu.mission_view == 'WrapUp' %} selected="selected"{% endif %}>Wrap Up</option>
								</select> 
							</div>


						</div>

					{% elif ksu.ksu_type == 'ImPe' %}
						<hr class="hr-1px-gray" style="margin-top:0px; margin-bottom:8px;">
		
						<div class="row" style="margin-bottom:8px;">

							<div class="col-xs-12 col-sm-8">
								<label>Important Person</label>
								<textarea type="text" class="form-control autoExpands QuickAttributeUpdate" rows="1" data-min-rows='1' id="description" name="description" placeholder="e.g. Mom, Dad, Jimmy, etc.">{% if ksu and ksu.description %}{{ksu.description}}{% endif %}</textarea>
							</div>
				
							<div class="col-xs-6 col-sm-4"> 
								<label> Frequency </label>			
								<input type="number" min="1" class="form-control QuickAttributeUpdate" id="frequency" name="frequency" placeholder="E.g. 7" value="{% if ksu %}{{ksu.frequency}}{% endif %}">
							</div>

							<div class="col-xs-6 col-sm-4">
								<label> Next event </label>
								<input type="date" class="form-control QuickAttributeUpdate" style="padding-right:3px;" id="next_event" name="next_event" value="{% if ksu %}{{ksu.next_event}}{% endif %}">
							</div>	

							<div class="col-xs-6 col-sm-4">
								<label> Birthday </label>
								<input type="date" class="form-control QuickAttributeUpdate" style="padding-right:3px;"  id="birthday" name="birthday" value="{% if ksu %}{{ksu.birthday}}{% endif %}">	
							</div>

							<div class="col-xs-6 col-sm-4">
								<label> Mission View </label>
								<select class="form-control QuickAttributeUpdate" name="mission_view" id="mission_view">						
									<option value="KickOff" {% if ksu.mission_view == 'KickOff' %} selected="selected"{% endif %}>Kick Off</option>
									<option value="AnywhereAnytime" {% if ksu.mission_view == 'AnywhereAnytime' %} selected="selected"{% endif %}>Anywhere Anytime</option>
									<option value="Principal" {% if ksu.mission_view == 'Principal' %} selected="selected"{% endif %}>Principal</option>
									<option value="WrapUp" {% if ksu.mission_view == 'WrapUp' %} selected="selected"{% endif %}>Wrap Up</option>
								</select> 
							</div>
						</div>

					{% elif ksu.ksu_type == 'ImIn' %}
						<hr class="hr-1px-gray" style="margin-top:8px; margin-bottom:8px;">

						<div class="row">
							<div class="col-xs-6 col-sm-4">
								<label> Question Frequency </label>			
								<input type="number" min="1" class="form-control QuickAttributeUpdate" id="frequency" name="frequency" placeholder="Days. E.g. 7" value="{% if ksu %}{{ksu.frequency}}{% endif %}">
							</div>

							<div class="col-xs-6 col-sm-4">
								<label> Next Question </label>
								<input type="date" class="form-control QuickAttributeUpdate" style="padding-right:3px;" id="next_event" name="next_event" value="{% if ksu %}{{ksu.next_event}}{% endif %}">
							</div>

							<div class="col-xs-6 col-sm-4">
								<label> Question time </label>
								<select class="form-control QuickAttributeUpdate" name="mission_view" id="mission_view">						
									<option value="KickOff" {% if ksu.mission_view == 'KickOff' %} selected="selected"{% endif %}>Kick Off</option>
									<option value="WrapUp" {% if ksu.mission_view == 'WrapUp' %} selected="selected"{% endif %}>Wrap Up</option>
								</select> 
							</div>
						</div>

					{% elif ksu.ksu_type == 'Diary' %}
						<hr class="hr-1px-gray" style="margin-top:8px; margin-bottom:8px;">
						<div class="row">
							<div class="col-xs-6 col-sm-4">
								<label> Question Frequency </label>			
								<input type="number" min="1" class="form-control QuickAttributeUpdate" id="frequency" name="frequency" placeholder="Days. E.g. 7" value="{% if ksu %}{{ksu.frequency}}{% endif %}">
							</div>

							<div class="col-xs-6 col-sm-4">
								<label> Next Question </label>
								<input type="date" class="form-control QuickAttributeUpdate" style="padding-right:3px;" id="next_event" name="next_event" value="{% if ksu %}{{ksu.next_event}}{% endif %}">
							</div>

							<div class="col-xs-6 col-sm-4">
								<label> Question time </label>
								<select class="form-control QuickAttributeUpdate" name="mission_view" id="mission_view">						
									<option value="KickOff" {% if ksu.mission_view == 'KickOff' %} selected="selected"{% endif %}>Kick Off</option>					
									<option value="WrapUp" {% if ksu.mission_view == 'WrapUp' %} selected="selected"{% endif %}>Wrap Up</option>
								</select> 
							</div>
						</div>
					
					{% endif %}		

						<hr class="hr-1px-gray" style="{% if ksu.ksu_subtype == 'KAS2' %}margin-top:0px;{% else %}margin-top:10px;{% endif %} margin-bottom:0px;">
						<div class="row">
							<div class="col-xs-12">
								<textarea class="autoExpand QuickAttributeUpdate" style="border:0; width:100%;" rows="3" data-min-rows='3' name="comments" id="comments" placeholder="Comments">{% if ksu.comments %}{{ ksu.comments }}{% endif %}</textarea>	
							</div>
						</div>		
					</div>
				</div>
			</div>	
		</div>
	</div>
</div>
"""