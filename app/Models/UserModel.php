<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class UserModel extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table="tbl_users";
    protected $primaryKey="id_user";

    protected $fillable = [
        'role',
        'nama_lengkap',
        'username',
        'email',
        'password',
        'avatar_url',
        'status'
    ];
    protected $perPage=99999999999999999999;

    protected $hidden = [
        'password',
        'remember_token'
    ];

    protected $casts = [
        'password' => 'hashed',
    ];


    //RELATIONSHIP
}
