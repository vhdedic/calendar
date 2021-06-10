@extends('layouts.layout')

@section('title', 'Create [New Event]')

@section('content')

<div class="row">
	<div class="col-md-4 col-md-offset-4">
		<div class="panel panel-default">
			<div class="panel-heading">
                <h3 class="panel-title">Add New Event</h3>
            </div>
			<div class="panel-body">
				<form action="{{ route('events.store')}}" method="POST">
					{{ csrf_field() }}
					<div class="form-group {{ ($errors->has('title')) ? 'has-error' : '' }}">
                     <label for="title">Title:</label>
                     <input type="text" name="title" class="form-control" value=""/>
					 {!! ($errors->has('title') ? $errors->first('title', '<p class="text-danger">:message</p>') : '') !!}
					</div>
					<div class="form-group {{ ($errors->has('start')) ? 'has-error' : '' }}">
                     <label for="start">Start:</label>
                     <input type="text" name="start" class="form-control date" value=""/>
					 {!! ($errors->has('start') ? $errors->first('start', '<p class="text-danger">:message</p>') : '') !!}
					</div>
					
					<div class="form-group {{ ($errors->has('end')) ? 'has-error' : '' }}">
					<label for="end">End:</label>
                     <input type="text" name="end" class="form-control date" value=""/>
					 {!! ($errors->has('end') ? $errors->first('end', '<p class="text-danger">:message</p>') : '') !!}
					</div>
					<div class="form-group">
					<label for="allDay">All Day:</label><br>
					<input type="radio" name="allDay" value="1"> Yes<br>
					<input type="radio" name="allDay" value="0"> No<br>
					{!! ($errors->has('allDay') ? $errors->first('allDay', '<p class="text-danger">:message</p>') : '') !!}
					</div>
					<br>
					<a class="btn btn-default" href="{{ route('events.index') }}">Back</a>
            <button class="btn btn-primary" type="submit" >Create</button>
				</form> 
			</div>	
		</div>
	</div>



            


@stop