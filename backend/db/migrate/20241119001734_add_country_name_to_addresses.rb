class AddCountryNameToAddresses < ActiveRecord::Migration[7.1]
  def change
    add_column :addresses, :country_name, :string
  end
end
