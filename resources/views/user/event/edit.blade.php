@extends('layouts.layout')

@section('title', 'Edit ['.$event->title.']')

@section('content')
  <div class="row">
	<div class="col-md-4 col-md-offset-4">
		<div class="panel panel-default">
			<div class="panel-heading">
                <h3 class="panel-title">Edit Event</h3>
            </div>
			<div class="panel-body">
				<form action="{{ route('events.update', $event->id) }}" method="POST">
					{{ csrf_field() }}
					<input type="hidden" name="_method" value="PUT">
					<div class="form-group">
                     <label for="title">Title</label>
                     <input type="text" name="title" class="form-control" value="{{$event->title}}"/>
                </div>
                    <div class="form-group">
                     <label for="start">Start</label>
                     <input type="text" name="start" class="form-control" value="{{$event->start}}"/>
                </div>
                    <div class="form-group">
                     <label for="end">End</label>
                     <input type="text" name="end" class="form-control" value="{{$event->end}}"/>
                </div>
				<div class="form-group">
					<label for="allDay">All Day:</label><br>
				@if ($event->allDay == 1)
					<input type="radio" name="allDay" value="1" checked> Yes<br>
					<input type="radio" name="allDay" value="0"> No<br>
					@else
						<input type="radio" name="allDay" value="1"> Yes<br>
					<input type="radio" name="allDay" value="0" checked> No<br>
				@endif
				</div>
					<br>
					<a class="btn btn-default" href="{{ route('events.index') }}">Back</a>
            <button class="btn btn-primary" type="submit" >Save</button>
				</form> 
			</div>	
		</div>
	</div>

    
@endsection
