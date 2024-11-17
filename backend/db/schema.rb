# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_11_17_201833) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "addresses", force: :cascade do |t|
    t.string "line1"
    t.string "line2"
    t.string "city"
    t.integer "country_id", null: false
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["country_id"], name: "index_addresses_on_country_id"
    t.index ["user_id"], name: "index_addresses_on_user_id"
  end

  create_table "attendances", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "event_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "checked_in"
    t.string "default"
    t.string "false"
    t.index ["event_id"], name: "index_attendances_on_event_id"
    t.index ["user_id", "event_id"], name: "index_attendances_on_user_id_and_event_id", unique: true
    t.index ["user_id"], name: "index_attendances_on_user_id"
  end

  create_table "bars", force: :cascade do |t|
    t.string "name"
    t.float "latitude"
    t.float "longitude"
    t.integer "address_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["address_id"], name: "index_bars_on_address_id"
  end

  create_table "bars_beers", force: :cascade do |t|
    t.integer "bar_id", null: false
    t.integer "beer_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bar_id", "beer_id"], name: "index_bars_beers_on_bar_id_and_beer_id", unique: true
    t.index ["bar_id"], name: "index_bars_beers_on_bar_id"
    t.index ["beer_id"], name: "index_bars_beers_on_beer_id"
  end

  create_table "beers", force: :cascade do |t|
    t.string "beer_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "brand_id"
    t.string "name"
    t.string "style"
    t.string "hop"
    t.string "yeast"
    t.string "malts"
    t.string "ibu"
    t.string "alcohol"
    t.string "blg"
    t.float "avg_rating"
    t.index ["brand_id"], name: "index_beers_on_brand_id"
  end

  create_table "brands", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "brewery_id", null: false
    t.index ["brewery_id"], name: "index_brands_on_brewery_id"
  end

  create_table "breweries", force: :cascade do |t|
    t.string "name"
    t.date "estdate"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "breweries_countries", id: false, force: :cascade do |t|
    t.integer "brewery_id", null: false
    t.integer "country_id", null: false
    t.index ["brewery_id", "country_id"], name: "index_breweries_countries_on_brewery_id_and_country_id"
    t.index ["country_id", "brewery_id"], name: "index_breweries_countries_on_country_id_and_brewery_id"
  end

  create_table "countries", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "event_pictures", force: :cascade do |t|
    t.integer "event_id", null: false
    t.integer "user_id", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_event_pictures_on_event_id"
    t.index ["user_id"], name: "index_event_pictures_on_user_id"
  end

  create_table "events", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.datetime "date"
    t.integer "bar_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.index ["bar_id"], name: "index_events_on_bar_id"
  end

  create_table "feed", force: :cascade do |t|
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_feed_on_user_id"
  end

  create_table "friendships", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "friend_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "bar_id"
    t.integer "event_id"
    t.index ["bar_id"], name: "index_friendships_on_bar_id"
    t.index ["friend_id"], name: "index_friendships_on_friend_id"
    t.index ["user_id", "friend_id"], name: "index_friendships_on_user_id_and_friend_id", unique: true
    t.index ["user_id"], name: "index_friendships_on_user_id"
    t.check_constraint "user_id != friend_id"
  end

  create_table "review_counters", force: :cascade do |t|
    t.integer "count"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "reviews", force: :cascade do |t|
    t.text "text"
    t.decimal "rating"
    t.integer "user_id", null: false
    t.integer "beer_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["beer_id"], name: "index_reviews_on_beer_id"
    t.index ["user_id"], name: "index_reviews_on_user_id"
  end

  create_table "taggings", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "event_picture_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_picture_id"], name: "index_taggings_on_event_picture_id"
    t.index ["user_id"], name: "index_taggings_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "age"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "jti", null: false
    t.string "handle"
    t.string "push_token"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["handle"], name: "index_users_on_handle", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "addresses", "countries"
  add_foreign_key "addresses", "users"
  add_foreign_key "attendances", "events"
  add_foreign_key "attendances", "users"
  add_foreign_key "bars", "addresses"
  add_foreign_key "bars_beers", "bars"
  add_foreign_key "bars_beers", "beers"
  add_foreign_key "beers", "brands"
  add_foreign_key "brands", "breweries"
  add_foreign_key "event_pictures", "events"
  add_foreign_key "event_pictures", "users"
  add_foreign_key "events", "bars"
  add_foreign_key "feed", "users"
  add_foreign_key "friendships", "bars"
  add_foreign_key "friendships", "events"
  add_foreign_key "friendships", "users"
  add_foreign_key "friendships", "users", column: "friend_id"
  add_foreign_key "reviews", "beers", on_delete: :cascade
  add_foreign_key "reviews", "users"
  add_foreign_key "taggings", "event_pictures"
  add_foreign_key "taggings", "users"
end
