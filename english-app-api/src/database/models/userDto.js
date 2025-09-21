class UserDTO {
    constructor(user = {}) {
        this.id = user.id;
        this.identification = user.identification;
        this.name = user.name;
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.password = user.password;
        this.email = user.email;
        this.phone = user.phone;
        this.password_token = user.password_token;
        this.state = user.state;
        this.profile = user.profile;
        this.url_image = user.url_image;
        this.image_name = user.image_name;
        this.token = user.token;
        this.created_at = user.created_at;
        this.updated_at = user.updated_at;
    }
}

module.exports = UserDTO;
