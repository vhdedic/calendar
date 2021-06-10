@extends('layouts.layout')

@section('title', 'Show ['.$event->title.']')

@section('content')


<div class="row">
	<div class="col-md-4 col-md-offset-4">
		<div class="panel panel-default">
			<div class="panel-heading">
                <h3 class="panel-title">Show Event</h3>
            </div>
			<div class="panel-body">
			
				<p>
					<strong>Title: </strong>{{$event->title}}
				</p>
				<p>
					<strong>Start: </strong>{{$event->start}}
				</p>
				<p>
					<strong>End: </strong>{{$event->end}}
				</p>
				<p>
					<strong>All Day: </strong>
						@switch($event->allDay)
							@case(0)
								No
								@break
							@case(1)
								Yes
								@break
						@endswitch
				</p>
			
  <br>

            


            
            <form action="{{ route('events.destroy', $event->id) }}" method="POST">
									{{ csrf_field() }}
									{{ method_field('DELETE') }}
									<a class="btn btn-default" href="{{ route('events.index') }}">Back</a>
            <a class="btn btn-warning" href="{{ route('events.edit', $event->id) }}">Edit</a>
				<button class="btn btn-danger">Delete</button>
			</form>
			</div>
			</div>					
        </div>
    </div>


@endsection