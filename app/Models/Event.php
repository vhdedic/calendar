<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\User;

class Event extends Model
{
    protected $table = 'events';
	protected $fillable = ['title','start','end'];
	public $timestamps = false;
	
	
	
}
