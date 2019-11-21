from setuptools import setup

setup(name='gsm',
      version='0.7',
      description='AI-centric framework for turn-based games',
      url='https://github.com/fleeb24/gsm',
      author='Felix Leeb',
      author_email='fleeb@tuebingen.mpg.edu',
      license='MIT',
      packages=['gsm'],
      install_requires=[
            'pyyaml',
      ],
      zip_safe=False)