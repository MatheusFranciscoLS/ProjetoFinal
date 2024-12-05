<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Não autorizado'], 401);
        }

        if (auth()->user()->tipo !== 'admin') {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        return $next($request);
    }
}
