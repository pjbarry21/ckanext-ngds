__author__ = 'Vivek'
import os, subprocess, glob


class ScriptCompiler(object):
    mpath = None

    def __init__(self, mpath):
        self.mpath = mpath

    def compile_less(self):
        imports_less_path = os.path.join(self.mpath, 'public', 'css')
        main_less_file = os.path.join(imports_less_path, 'main.less')
        css_file = os.path.join(imports_less_path, 'main.css')
        subprocess.call(["/usr/local/bin/lessc " + main_less_file + " -o --yui-compress " + css_file], shell=True)

    def minify_js(self):
        scripts_path = os.path.join(self.mpath, 'public', 'scripts')
        self._minify(scripts_path)

    def _minify(self, scripts_path):
        # print glob.glob(os.path.join(scripts_path, "*"))
        if os.path.isdir(scripts_path):
            map(lambda x: self._minify(x), glob.glob(os.path.join(scripts_path, "*")))
        else:
            if scripts_path.endswith('min.js'):
                return
            print os.path.splitext(scripts_path)[0] + "-min.js " + scripts_path
            subprocess.call(["yui-compressor -o " + os.path.splitext(scripts_path)[0] + ".min.js " + scripts_path],
                            shell=True)



