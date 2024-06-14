<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbl_users', function (Blueprint $table) {
            $table->id("id_user");
            $table->string("nama_lengkap");
            $table->string("username")->unique();
            $table->string("email")->unique();
            $table->text("password");
            $table->text("avatar_url");
            $table->string("role");
            $table->string("status")->default("active");
            $table->rememberToken();
            $table->timestamps();

            //fk
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_users');
    }
};
