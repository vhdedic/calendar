<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->app->bind('Centaur\Middleware\SentinelGuest', function ($app) {
            return new \App\Http\Middleware\SentinelGuest;
        });
        $this->app->bind('Centaur\Middleware\SentinelAuthenticate', function ($app) {
            return new \App\Http\Middleware\SentinelAuthenticate;
        });
        $this->app->bind('Centaur\Middleware\SentinelUserHasAccess', function ($app) {
            return new \App\Http\Middleware\SentinelUserHasAccess;
        });
        $this->app->bind('Centaur\Middleware\SentinelUserInRole', function ($app) {
            return new \App\Http\Middleware\SentinelUserInRole;
        });
        Schema::defaultStringLength(191);
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
