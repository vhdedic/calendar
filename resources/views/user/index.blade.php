@extends('layouts.layout')

@section('title', 'Events')

@section('content')


<div>
	<a href="{{ route('events.create') }}" class="btn btn-info btn-sm" role="button">New Event</a>
</div><br>
<div id="calendar"></div>

<script>
$(document).ready(function() {
        
        $('#calendar').fullCalendar({
            allDayText: 'All day',
			weekNumbers: true,
			weekNumberTitle: 'Week ',
			timeFormat: 'H:mm',
            events : [
                @foreach($events as $event)
				
					@if ($event->user_id === Sentinel::getUser()->id)
					{
						title : '{{ $event->title }}',
						start : '{{ $event->start }}',
						allDay : {{ $event->allDay }},
						url : '{{ route('events.show', $event->id) }}'
					},
					@endif
                @endforeach
				
            ],
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'agendaDay,agendaWeek,month ',
		},
		
        })
    });
</script>


@stop