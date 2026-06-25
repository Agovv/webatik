<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Symfony\Component\HttpFoundation\Response;

class ConfigurePasskeysForCurrentHost
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Config::set('passkeys.relying_party_id', $request->getHost());
        Config::set('passkeys.allowed_origins', [$request->getSchemeAndHttpHost()]);

        return $next($request);
    }
}
