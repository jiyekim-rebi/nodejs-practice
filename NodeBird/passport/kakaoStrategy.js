const passport = require('passport')
const KakaoStrategy = require('passport-kakao').Strategy

const User = require('../models/user')

module.exports = () => {
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_ID,
        callbackURL: '/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        console.log('kakao profile', profile)
        try {
            const exUser = await User.findOne({
                where: { snsId: profile.id, provider: 'kakao' },
            })
            if (exUser) {
                done(null, exUser);
            } else { // 회원정보가 없으면 가입 진행
                const newUser = await User.create({
                    email: profile._json?.kakao_account?.email, // 체이닝 문법? (https://ko.javascript.info/optional-chaining)
                    nick: profile.displayName,
                    snsId: profile.id,
                    provider: 'kakao',
                })
                done(null, newUser)
            }
        } catch (error) {
            console.error(error)
            done(error)
        }
    }))
}