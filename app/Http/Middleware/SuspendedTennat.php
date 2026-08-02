<?php

namespace App\Http\Middleware;

use App\Models\Central\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuspendedTennat
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = tenancy()->tenant;

        if ($tenant instanceof Tenant && $tenant->isSuspended()) {
            abort(403, 'Site suspended');
        }

        if (
            $tenant instanceof Tenant
            && $tenant->isReadOnly()
            && ! in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'], true)
        ) {
            abort(423, 'This workspace is read-only while billing is inactive.');
        }

        return $next($request);
    }
}
