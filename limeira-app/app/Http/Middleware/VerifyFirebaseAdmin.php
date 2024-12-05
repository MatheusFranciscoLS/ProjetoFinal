<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Contract\Auth;
use Kreait\Firebase\Contract\Database;

class VerifyFirebaseAdmin
{
    protected $auth;
    protected $database;

    public function __construct(Auth $auth, Database $database)
    {
        $this->auth = $auth;
        $this->database = $database;
    }

    public function handle(Request $request, Closure $next)
    {
        try {
            $token = $request->bearerToken();
            
            if (!$token) {
                return response()->json(['message' => 'Token não fornecido'], 401);
            }

            // Verifica o token e obtém o usuário
            $verifiedIdToken = $this->auth->verifyIdToken($token);
            $uid = $verifiedIdToken->claims()->get('sub');

            // Consulta o Firestore para verificar se o usuário é admin
            $userRef = $this->database->getReference('users/' . $uid);
            $user = $userRef->getValue();

            if (!$user || !isset($user['tipo']) || $user['tipo'] !== 'admin') {
                return response()->json(['message' => 'Acesso não autorizado. Apenas administradores podem acessar este recurso.'], 403);
            }

            // Adiciona o UID do usuário ao request para uso posterior
            $request->merge(['firebase_uid' => $uid]);

            return $next($request);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Token inválido ou expirado'], 401);
        }
    }
}
