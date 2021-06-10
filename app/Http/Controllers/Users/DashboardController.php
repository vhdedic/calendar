<?php

namespace App\Http\Controllers\Users;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    /**
     * Set middleware to quard controller.
     *
     * @return void
     */
      public function __construct()
      {
          $this->middleware('sentinel.auth');
          //$this->middleware('sentinel.role:subscriber');
      }

      /**
       * Display a listing of the resource.
       *
       * @return \Illuminate\Http\Response
       */
      public function index()
      {
          return view('dashboard');
      }
}
