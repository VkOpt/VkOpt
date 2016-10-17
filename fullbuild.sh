cd `dirname $0`
sh ./_build.sh

cd "`dirname $0`/builds"

sh ./_firefox_pack.sh
#sh ./_chrome_pack.sh
#sh ./_firefox_jetpack_pack.sh