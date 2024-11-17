require 'factory_bot_rails'

# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Initialize the review counter
ReviewCounter.create(count: 0)

if Rails.env.development?

  # Crear países
  countries = FactoryBot.create_list(:country, 5)

  # Crear cervecerías (breweries) con marcas (brands) y cervezas (beers)
  countries.map do |country|
    FactoryBot.create(:brewery_with_brands_with_beers, countries: [country])
  end

  # Crear usuarios con direcciones asociadas
  users = FactoryBot.create_list(:user, 10) do |user, i|
    user.address.update(country: countries.sample)
  end

  # Crear bares con direcciones y cervezas asociadas
  bars = FactoryBot.create_list(:bar, 5) do |bar|
    bar.address.update(country: countries.sample)
    bar.beers << Beer.all.sample(rand(1..3))
  end

  # Crear eventos asociados a los bares
  events = bars.map do |bar|
    FactoryBot.create(:event, bar: bar)
  end

  # Crear relaciones de amistad entre usuarios
  users.combination(2).to_a.sample(5).each do |user_pair|
    FactoryBot.create(:friendship, user: user_pair[0], friend: user_pair[1], bar: bars.sample)
  end

  # Crear attendances (asistencia) de usuarios a eventos
  users.each do |user|
    events.sample(rand(1..3)).each do |event|
      FactoryBot.create(:attendance, user: user, event: event, checked_in: [true, false].sample)
    end
  end

  # beers.each do |beer|
  #   rand(3..5).times do
  #     FactoryBot.create(:review, user: users.sample, beer: beer, text: Faker::Lorem.sentence(word_count: rand(15..30)), rating: rand(1..5))
  #   end
  # end

  users = (1..9).map do |i|
    FactoryBot.create(:user,
      email: "#{i}@#{i}.com",
      handle: "number_#{i}",
      first_name: "number #{i}",
      last_name: "number #{i}",
      password: '123456')
  end

  # Crear relaciones de amistad aleatorias entre los usuarios
  users.each_with_index do |user, index|
    # Seleccionar 2 usuarios aleatorios diferentes al actual
    friends = users.reject { |u| u == user }
    selected_friends = friends.sample(2)

    selected_friends.each do |friend|
      FactoryBot.create(:friendship, user: user, friend: friend)
    end
  end
end
