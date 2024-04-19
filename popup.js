// let baseURL =  "http://127.0.0.1:8000/api/v1"
let baseURL = 'http://34.86.26.236/api/v1';
let token =  null;
let loadingDiv = `<div class="spinner-border" role="status"><span class="sr-only"></span></div>`

function isEmailValid(email) {
    // Regular expression for email validation
    var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
}

$(document).ready(function () {
    function updatePageVisibility() {
        chrome.storage.local.get(["authToken"], (res) => {
            if (res.hasOwnProperty('authToken')) {
                $("#login-page").hide();
                $("#login-success").hide();
                $("#dashboard-page").show();
                $("#sidepanel").hide();
                $(".login_menu").show();
                $("#change-pwd").hide();
                $("#profile-page").hide();
                token = res.authToken
            } else {
                $("#login-page").show();
                $("#login-success").hide();
                $("#dashboard-page").hide();
                $(".login_menu").hide();
                $("#change-pwd").hide();
                $("#profile-page").hide();
                $("#sidepanel").hide();
                token = null
            }
        });
    }

    // Initial page setup
    updatePageVisibility();

    // Listen for changes in chrome.storage.local
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        if (namespace === 'local' && changes.hasOwnProperty('authToken')) {
            updatePageVisibility();
        }
    });
    $("#login-form").on("submit", (e) => {
        e.preventDefault();
        $(".error-login").hide();
        if($("#username").val().trim().length === 0) {
            $(".error-login").text("Username is required");
            $(".error-login").show();
            return false
        }
        if($("#password").val().trim().length === 0) {
            $(".error-login").text("Password is required");
            $(".error-login").show();
            return false
        }
        var settings = {
            "url": `${baseURL}/login/`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify({
                "username": $("#username").val(),
                "password": $("#password").val()
            }),
        };
        $.ajax({
            ...settings,
            success: (res) => {
                chrome.storage.local.set({ authToken: res.jwt_token });
                $("#login-page").hide()
                $("#login-success").show()
                setTimeout(() => {
                    $("#login-success").hide()
                    $("#dashboard-page").show()
                }, 2000)
                reloadAllTabs();
            },
            error: (err) => {
                console.log(err)
                $(".error-login").text(err.responseJSON.message);
                $(".error-login").show();
            }
        })
    })
    $(".logout-btn").on("click", (e) => {
        $(".offcanvas, .offcanvas-backdrop").removeClass('show')
        chrome.storage.local.set({ authToken: "" });
        chrome.storage.local.remove("authToken");
        reloadAllTabs();
    })
    $(".change-pwd-btn").on("click", (e) => {
        $(".offcanvas, .offcanvas-backdrop").removeClass('show')
        $("#dashboard-page").hide()
        $("#change-pwd").show()
        $("#profile-page").hide()
        $("#sidepanel").hide()
    })
    $(".change-profile-btn").on("click", (e) => {
        $(".offcanvas, .offcanvas-backdrop").removeClass('show')
        $("#dashboard-page").hide()
        $("#change-pwd").hide()
        $("#profile-page").show()
        $("#sidepanel").hide()
        var settings = {
            "url": `${baseURL}/me/`,
            "method": "GET",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        };
        $.ajax({
            ...settings,
            success: (res) => {
                $("#profile_username").val(res.user.username),
                $("#first_name").val(res.user.first_name),
                $("#last_name").val(res.user.last_name),
                $("#profile_email").val(res.user.email)
            },
            error: (err) => {
                console.log(err)
            }
        })
    })
    $("#change-pwd").on("submit", (e) => {
        e.preventDefault();
        $("#change-pwd .error-change-pwd").text("")
        $("#change-pwd .error-change-pwd, .success-change-pwd").hide()
        if($("#current-password").val().trim().length === 0) {
            $("#change-pwd .error-change-pwd").text("Current Password is required.")
            $("#change-pwd .error-change-pwd").show()
            return false;
        }
        if($("#new_password").val().trim().length === 0) {
            $("#change-pwd .error-change-pwd").text("New Password is required.")
            $("#change-pwd .error-change-pwd").show()
            return false;
        }
        if($("#c_password").val().trim().length === 0) {
            $("#change-pwd .error-change-pwd").text("Confirm Password is required.")
            $("#change-pwd .error-change-pwd").show()
            return false;
        }
        if($("#current-password").val().trim() === $("#new_password").val().trim()) {
            $("#change-pwd .error-change-pwd").text("New Password and Old Password must not be same.")
            $("#change-pwd .error-change-pwd").show()
            return false;
        }
        if($("#c_password").val().trim() !== $("#new_password").val().trim()) {
            $("#change-pwd .error-change-pwd").text("New Password and Confirm Password must be same.")
            $("#change-pwd .error-change-pwd").show()
            return false;
        }
        var settings = {
            "url": `${baseURL}/me/change-password/`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            "data": JSON.stringify({
                "current_password": $("#current-password").val().trim(),
                "new_password": $("#new_password").val().trim()
            }),
        };
        $("#change-pwd button").html(loadingDiv)
        $("#change-pwd button").attr("disabled", true)
        $.ajax({
            ...settings,
            success: (res) => {
                $("#change-pwd .success-change-pwd").text(res.message)
                $("#change-pwd .success-change-pwd").show()
                $("#current-password, #new_password, #c_password").val("")
                $("#change-pwd button").html('Continue')
                $("#change-pwd button").attr("disabled", false)
            },
            error: (err) => {
                $("#change-pwd .error-change-pwd").text(err.responseJSON.message)
                $("#change-pwd .error-change-pwd").show()
                $("#change-pwd button").html('Continue')
                $("#change-pwd button").attr("disabled", false)
            }
        })
    })

    $("#change-profile-form").on("submit", (e) => {
        e.preventDefault();
        $("#change-profile-form .error-change-pwd").text("")
        $("#change-profile-form .error-change-pwd, .success-change-pwd").hide()

        if($("#profile_email").val().trim().length === 0) {
            $("#change-profile-form .error-change-pwd").text("Email is required.")
            $("#change-profile-form .error-change-pwd").show()
            return false;
        }
        if(!isEmailValid($("#profile_email").val().trim())) {
            $("#change-profile-form .error-change-pwd").text("Valid email is required.")
            $("#change-profile-form .error-change-pwd").show()
            return false;
        }
        if($("#first_name").val().trim().length === 0) {
            $("#change-profile-form .error-change-pwd").text("First name is required.")
            $("#change-profile-form .error-change-pwd").show()
            return false;
        }
        var settings = {
            "url": `${baseURL}/me/update/`,
            "method": "PUT",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            "data": JSON.stringify({
                //"username": $("#profile_username").val(),
                "first_name": $("#first_name").val().trim(),
                "last_name": $("#last_name").val().trim(),
                "email": $("#profile_email").val().trim()
            }),
        };
        $("#change-profile-form button").html(loadingDiv)
        $("#change-profile-form button").attr("disabled", true)
        $.ajax({
            ...settings,
            success: (res) => {
                $("#change-profile-form .success-change-pwd").text(res.message)
                $("#change-profile-form .success-change-pwd").show()
                // $("#profile_username, #first_name, #last_name, #profile_email").val("")
                $("#change-profile-form button").html('Update')
                $("#change-profile-form button").attr("disabled", false)
            },
            error: (err) => {
                $("#change-profile-form .error-change-pwd").text(err.responseJSON.message)
                $("#change-profile-form .error-change-pwd").show()
                $("#change-profile-form button").html('Update')
                $("#change-profile-form button").attr("disabled", false)
            }
        })
    })
});
function reloadAllTabs() {
    chrome.tabs.query({}, function (tabs) {
      for (let i = 0; i < tabs.length; i++) {
        chrome.tabs.reload(tabs[i].id);
      }
    });
  }