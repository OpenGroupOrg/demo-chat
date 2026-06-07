<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthenticationController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // 1. User für den Cookie-Modus einloggen (setzt das Session Cookie)
        Auth::login($user);

        // 2. Token für den Token-Modus generieren
        $token = $user->createToken('auth_token')->plainTextToken;

        // 3. Antwort an das React-Frontend senden
        return response()->json([
            'token' => $token,       // Umbenannt von 'access_token' auf 'token'
            'token_type' => 'Bearer',
            'user' => $user,         // Wichtig für setUser(data.user) in React
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credentials not matched !'], 401);
        }

        // 1. User für den Cookie-Modus einloggen
        Auth::login($user);

        // 2. Token für den Token-Modus generieren
        $token = $user->createToken('auth_token')->plainTextToken;

        // 3. Antwort an das React-Frontend senden
        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        // 1. Token-Modus: Aktuelles Token löschen (falls über Token eingeloggt)
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        // 2. Cookie-Modus: Web-Session zerstören
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
