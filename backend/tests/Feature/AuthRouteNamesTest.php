<?php

namespace Tests\Feature;

use Tests\TestCase;

class AuthRouteNamesTest extends TestCase
{
    public function test_auth_routes_are_available_by_name(): void
    {
        $this->assertStringEndsWith('/api/login', route('login'));
        $this->assertStringEndsWith('/api/register', route('register'));
    }
}
