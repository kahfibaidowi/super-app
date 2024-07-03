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
        Schema::create('tbl_kontak_group_detail', function (Blueprint $table) {
            $table->id("id_detail");
            $table->unsignedBigInteger("id_kontak");
            $table->unsignedBigInteger("id_group");
            $table->timestamps();

            //fk
            $table->foreign("id_kontak")->references("id_kontak")->on("tbl_kontak")->onDelete("cascade");
            $table->foreign("id_group")->references("id_group")->on("tbl_kontak_group")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_kontak_group_detail');
    }
};
