<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        \App\Models\UserModel::create([
            'id_kriteria'   =>null,
            'role'          =>"admin",
            'username'      =>"admin",
            'email'         =>"admin@gmail.com",
            'nama_lengkap'  =>"admin",
            'password'      =>Hash::make("admin"),
            'avatar_url'    =>"",
            'status'        =>"active"
        ]);
    }
}
