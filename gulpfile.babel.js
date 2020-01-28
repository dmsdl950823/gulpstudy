// import 시키기
// const gulp = require("gulp");

// gulpfile.js 는 js 언어를 이해하지 못하므로
// gulpfile.babel.js 로 변경

// 내가원하는대로 import 할 수 있음
import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import sass from "gulp-sass";
import autop from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";

sass.compiler = require("node-sass");

const routes = {
  pug: {
    watch: "src/**/*.pug", // 폴더안의 .pug 파일 모두 관찰
    src: "src/*.pug", // src안의 가장 위 pug 파일을 이용할것.
    dest: "build", // destination 폴더 안에 컴파일
  },
  img: {
    src: "src/img/*", // img 폴더의 모든 것
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

// Task 란:
// gulp는 task와 함께 동작함
// pug 파일을 html로 변환후 다른 폴더에 입력
// scss -> css 파일로 변환 -> 최소화, 폴더에 입력

const pug = () =>
  // API는 홈페이지에서 확인
  gulp
    .src(routes.pug.src)
    .pipe(gpug()) // pipe: 연결
    .pipe(gulp.dest(routes.pug.dest)); // dest: destination - 어디에 저장할 것인가

// build 를 전부 비우고 재시작
// $ npm add del
const clean = () => del(["build", ".publish"]);

// webserver로 열기
const webserver = () =>
  gulp.src("build").pipe(ws({ livereload: true, open: true }));

// image 컴파일
const img = () =>
  gulp
    .src(routes.img.src)
    .pipe(image()) // image from 'gulp-image'
    .pipe(gulp.dest(routes.img.dest));

// scss -> css
const styles = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError)) // sass만의 에러출력후 css 생성중단
    .pipe(
      autop({}) // 지정한 browser에 맞추어 css 변환, package.json에 입력 -  npm 홈페이지에 정보O
    )
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

// 배포 - github로
const deployment = () => gulp.src("build/**/*").pipe(ghPages());

// gulp-watch : 변화하는 파일을 확인후, callback function을 실행함
const watch = () => {
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.img.src, img); // 이미지 추적은 시간이 걸릴 수 있음
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};

// build폴더를 먼저 비우기, image 최적화
const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

const live = gulp.series([webserver, watch]); // server를 확인한 후, 변화 관찰
// const live = gulp.parallel([webserver, watch]); // pararell: 동시에 server를 확인하면서 변화 관찰

// export 는 package.json 에서 쓸 command만 해주면 됨
// prepare후 assets 실행
export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([prepare, assets, live]);
// package.json의 "scripts"에서 "dev" Task가 dev로 설정되어있음.
// export const dev = () => console.log("I will dev");
// $ gulp dev 를 커맨드시키면 출력 시작
// $ gulp     는 커맨드 출력 X

export const deploy = gulp.series([build, deployment, clean]);
