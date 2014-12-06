var lib = require('../own_modules/school_records');
var assert = require('chai').assert;
var fs = require('fs');
var dbFileData = fs.readFileSync('tests/data/school.db.backup');

var school_records;
describe('school_records',function(){
	beforeEach(function(){
		fs.writeFileSync('tests/data/school.db',dbFileData);
		school_records = lib.init('tests/data/school.db');
	});
	
	describe('#getGrades',function(){
		it('retrieves 2 grades',function(done){
			school_records.getGrades(function(err,grades){
				assert.deepEqual(grades,[{id:1,name:'class1'},{id:2,name:'class2'}]);
				done();
			})
		})
	})

	describe('#getStudentsByGrade',function(){
		it('retrieves the students in the 2 grades',function(done){
			school_records.getStudentsByGrade(function(err,grades){
				assert.lengthOf(grades,2);
				assert.lengthOf(grades[0].students,3);
				assert.lengthOf(grades[1].students,3);
				done();
			})
		})
	})

	describe('#getSubjectsByGrade',function(){
		it('retrieves the subjects in the 2 grades',function(done){
			school_records.getSubjectsByGrade(function(err,grades){
				assert.lengthOf(grades,2);
				assert.lengthOf(grades[0].subjects,3);
				assert.lengthOf(grades[1].subjects,3);
				done();
			})
		})
	})

	describe('#getStudentSummary',function(){
		it('retrieves the summary of the student Jai',function(done){
			school_records.getStudentSummary(4, function(err,s){				
				assert.equal(s.name,'Jai');
				assert.equal(s.grade_name,'class2');
				assert.deepEqual(s.subjects,[{id:4,name:'Baseball',score:100,maxScore:100},
					{id:5,name:'Chess',score:45,maxScore:50},
					{id:6,name:'Rowing',score:24,maxScore:25}]);
				done();
			})
		})

		it('retrieves nothing of the non existent student',function(done){
			school_records.getStudentSummary(9, function(err,s){
				assert.notOk(err);
				assert.notOk(s);				
				done();
			})
		})
	})

	describe('#getSubjectSummary',function(){
		it('retrieves the summary of all Subjects',function(done){
			school_records.getSubjectSummary(function(err,subjectSummary){
				assert.lengthOf(subjectSummary,6);
				assert.lengthOf(Object.keys(subjectSummary[0]),4);
				done();
			})
		})
	})

	describe('#update Grade from grades',function(){
		it('true if updation of class1 into class7 successful',function(done){
			school_records.update_Grade({prev_grade:'1',new_grade:'class7'},function(err,result){
				assert.notOk(err);
				assert.ok(result);
				done();
			})
		})
		it('on grade id:1 class1 set to class7 after updation',function(done){
			school_records.getGrades(function(err,grades){
				assert.deepEqual(grades,[{id:1,name:'class7'},{id:2,name:'class2'}]);
				done();
			})
		})
	})

	describe('#update grade,student_name,score from StudentSummary',function(){
		it('true if updation of grade,student_name,score is successful',function(done){
			var param = { id: '2',new_name: 'Ramu',new_grade: '1',subject: '1',new_score: '88' };
			school_records.updateStudentSummary(param,function(err,result){
				assert.notOk(err);
				assert.ok(result);
				done();
			})
		})
	})

	describe('#update subject name,maxScore and grade from SubjectSummary',function(){
		it('true if updation of subject name,maxScore and grade is successful',function(done){
			var param = {subject_id:'4',new_grade:'2',new_name:'KungFu',new_score:'100'};
			school_records.updateSubjectSummary(param,function(err,result){
				assert.notOk(err);
				assert.ok(result);
				done();
			})
		})
		// it("after updation new_name='KungFu' on id=4",function(done){
		// 	school_records.getSubjectSummary(function(err,subjectSummary){
		// 		console.log(subjectSummary);
		// 		done();
		// 	})
		// })
	})
})