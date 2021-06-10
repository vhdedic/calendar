<?php

namespace App\Http\Controllers\Users;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Controllers\User;
use App\Models\Event;
use Validator;
use Auth;
use Sentinel;
use Calendar;


class EventController extends Controller

{
	
	
    public function __construct()
      {
          $this->middleware('sentinel.auth');
          //$this->middleware('sentinel.role:free');
	  }
	/**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
		$events = Event::all();
		return view('user.index', compact('events'));
		
	}

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view ('user.event.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        
		$event = new Event();
		
		$input = $request->only('user_id', 'title', 'start', 'end', 'allDay');
		$event->user_id = Sentinel::getUser()->id;
		$event->title = $request->input("title");
        $event->start = $request->input("start");
        $event->end = $request->input("end");
        $event->allDay = $request->input("allDay");
		
		$input = request()->validate([

			'title' => 'required',
			'start' => 'required | date_format:Y-m-d H:i',
			'end' => 'required | date_format:Y-m-d H:i',
			'allDay' => 'required',

            ]);
		

		
		
		$event->save();
		return back()->with('success', 'Event created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {

		$event = Event::find($id);

        return view('user.event.show', compact('event'));
		
		
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        return view('user.event.edit')->with('event', Event::find($id));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $event = Event::find($id);

        $event->title = $request->input('title');
        $event->start = $request->input('start');
        $event->end = $request->input('end');
        $event->allDay = $request->input("allDay");
        
        $event->save();

        return redirect()->route('events.index')->with('success', 'Event updated successfully.');
			
	}
    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $event = Event::find($id);
		$event->delete();
		
		return redirect()->route('events.index')->with('success','Event deleted successfully');
    }
	
}
