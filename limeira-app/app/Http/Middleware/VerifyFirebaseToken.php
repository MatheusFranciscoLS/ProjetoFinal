<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Auth as FirebaseAuth;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;

class VerifyFirebaseToken
{
    protected $auth;

    public function __construct(FirebaseAuth $auth)
    {
        $this->auth = $auth;
    }

    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'error' => true,
                'message' => 'Token não fornecido'
            ], 401);
        }

        try {
            $verifiedIdToken = $this->auth->verifyIdToken($token);
            $uid = $verifiedIdToken->claims()->get('sub');
            $request->attributes->add(['firebase_uid' => $uid]);
            return $next($request);
        } catch (FailedToVerifyToken $e) {
            return response()->json([
                'error' => true,
                'message' => 'Token inválido'
            ], 401);
        }
    }
}
