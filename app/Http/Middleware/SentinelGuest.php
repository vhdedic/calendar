<?php

namespace App\Http\Middleware;

use Closure;
use Sentinel;

class SentinelGuest
{
    use TranslationHelper;

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (Sentinel::check()) {
            if ($request->ajax()) {
                $message = $this->translate('unauthorized', 'Unauthorized');
                return response()->json(['error' => $message], 401);
            } else {
                if(Sentinel::inRole('administrator')) {
                    return redirect()->route('events.index');
                }
                if(Sentinel::inRole('free')) {
                    return redirect()->route('events.index');
                }
                return redirect()->route('events.index');
            }
        }

        return $next($request);
    }
}
