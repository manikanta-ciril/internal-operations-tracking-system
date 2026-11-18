<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class RequireLeadIntegration
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $token = $user ? $user->currentAccessToken() : null;
        abort_unless($request->bearerToken() && $token instanceof PersonalAccessToken, 403, 'Use a dedicated bearer token.');
        abort_unless((int) $user->status === 1 && (int) $user->roleId === 1, 403, 'An active CRM administrator is required.');
        abort_unless($token->name === 'iots-crm-readonly' && $token->abilities === ['crm:read']
            && $token->expires_at && $token->expires_at->isFuture(), 403, 'Use a restricted, unexpired leads token.');
        abort_unless($request->isSecure() || (app()->environment('local', 'testing')
            && in_array($request->getHost(), ['localhost', '127.0.0.1', '::1'], true)), 403, 'HTTPS is required.');
        $response = $next($request);
        $response->headers->set('Cache-Control', 'no-store');
        Log::info('CRM leads API read', ['actor_id' => $user->id, 'token_id' => $token->id,
            'path' => $request->path(), 'status' => $response->getStatusCode()]);
        return $response;
    }
}
