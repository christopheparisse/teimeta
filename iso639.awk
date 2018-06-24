FS = "|"
BEGIN { print "export let code639 = [" }
END { print "];" }
{ printf "{ code: \"%s\", code2: \"%s\", code2l: \"%s\", name: \"%s\", desc: \"%s\" },\n", $1, $2, $3, $4, $5; }
