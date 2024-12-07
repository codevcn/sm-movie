myA = [1,2,3,4]
import joblib
joblib.dump(myA, 'a.plk')

t = joblib.load('a.plk')
print(type(t))